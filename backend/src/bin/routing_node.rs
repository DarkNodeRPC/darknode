//! DarkNode Routing Node
//!
//! This binary implements a routing node in the DarkNode network.
//! Routing nodes are intermediate nodes in the circuit and are responsible for:
//! 1. Receiving encrypted requests from previous hops
//! 2. Decrypting the layer of encryption for this hop
//! 3. Re-encrypting for the next hop
//! 4. Forwarding to the next hop
//! 5. Handling responses in the reverse direction

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::SystemTime;

use anyhow::Result;
use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use darknode_backend::{
    impls::CryptoImpl,
    routing_node::RoutingNodeService,
    traits::{Crypto, NodeManager},
    types::{NodeId, NodeRole, NodeStatus, Request, Response},
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::{filter, prelude::*};
use uuid::Uuid;

/// Configuration for the routing node
#[derive(Debug, Clone, Deserialize)]
struct Config {
    /// The address to listen on
    listen_addr: SocketAddr,
    /// The region this node is in
    region: String,
    /// The coordinator node to register with
    coordinator_url: String,
}

/// Request body for forwarding requests
#[derive(Debug, Clone, Deserialize)]
struct ForwardRequest {
    /// The encrypted request
    request: Request,
}

/// Response body for forwarding responses
#[derive(Debug, Clone, Serialize)]
struct ForwardResponse {
    /// Whether the forwarding was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Request body for receiving responses
#[derive(Debug, Clone, Deserialize)]
struct ReceiveResponse {
    /// The encrypted response
    response: Response,
}

/// Response body for receiving responses
#[derive(Debug, Clone, Serialize)]
struct ReceiveResponseResult {
    /// Whether the receiving was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Mock implementation of the NodeManager trait
struct MockNodeManager {
    nodes: Arc<RwLock<Vec<darknode_backend::types::Node>>>,
}

impl MockNodeManager {
    fn new() -> Self {
        Self {
            nodes: Arc::new(RwLock::new(Vec::new())),
        }
    }
}

#[async_trait::async_trait]
impl NodeManager for MockNodeManager {
    async fn register_node(&self, node: darknode_backend::types::Node) -> Result<()> {
        let mut nodes = self.nodes.write().await;
        nodes.push(node);
        Ok(())
    }

    async fn update_node_status(&self, node_id: &NodeId, status: NodeStatus) -> Result<()> {
        let mut nodes = self.nodes.write().await;
        if let Some(node) = nodes.iter_mut().find(|n| n.id == *node_id) {
            node.status = status;
        }
        Ok(())
    }

    async fn get_available_nodes(&self, role: NodeRole) -> Result<Vec<darknode_backend::types::Node>> {
        let nodes = self.nodes.read().await;
        Ok(nodes
            .iter()
            .filter(|n| n.role == role && n.status == NodeStatus::Online)
            .cloned()
            .collect())
    }

    async fn get_node(&self, node_id: &NodeId) -> Result<Option<darknode_backend::types::Node>> {
        let nodes = self.nodes.read().await;
        Ok(nodes.iter().find(|n| n.id == *node_id).cloned())
    }
}

/// Handler for forwarding requests
async fn handle_forward_request(
    Json(request): Json<ForwardRequest>,
    Extension(service): Extension<Arc<RoutingNodeService>>,
) -> Result<Json<ForwardResponse>, StatusCode> {
    // Process the request
    match service.handle_request(&request.request).await {
        Ok(_) => Ok(Json(ForwardResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(ForwardResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for receiving responses
async fn handle_receive_response(
    Json(response): Json<ReceiveResponse>,
    Extension(service): Extension<Arc<RoutingNodeService>>,
) -> Result<Json<ReceiveResponseResult>, StatusCode> {
    // Process the response
    match service.handle_response(&response.response).await {
        Ok(_) => Ok(Json(ReceiveResponseResult {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(ReceiveResponseResult {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for health checks
async fn health_check() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(filter::LevelFilter::from_level(Level::INFO))
        .with(tracing_subscriber::fmt::layer())
        .init();
    
    // Load configuration
    let config = Config {
        listen_addr: "127.0.0.1:3003".parse()?,
        region: "us-east".to_string(),
        coordinator_url: "http://localhost:3001".to_string(),
    };
    
    info!("Starting routing node in region {}", config.region);
    
    // Create dependencies
    let crypto: Arc<dyn Crypto + Send + Sync> = Arc::new(CryptoImpl);
    
    // Create the routing node service
    let service = Arc::new(RoutingNodeService::new(
        NodeId(Uuid::new_v4()),
        crypto,
    ));
    
    // Create the router
    let app = Router::new()
        .route("/forward", post(handle_forward_request))
        .route("/receive", post(handle_receive_response))
        .route("/health", get(health_check))
        .layer(TraceLayer::new_for_http())
        .layer(Extension(service));
    
    // Start the server
    info!("Listening on {}", config.listen_addr);
    axum::Server::bind(&config.listen_addr)
        .serve(app.into_make_service())
        .await?;
    
    Ok(())
}
