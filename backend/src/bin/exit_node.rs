//! DarkNode Exit Node
//!
//! This binary implements an exit node in the DarkNode network.
//! Exit nodes are the final point in the circuit and are responsible for:
//! 1. Decrypting the final layer of encryption
//! 2. Forwarding requests to RPC providers
//! 3. Receiving responses from RPC providers
//! 4. Encrypting responses for the return journey
//! 5. Sending responses back through the circuit

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, SystemTime};

use anyhow::Result;
use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use darknode_backend::{
    exit_node::ExitNodeService,
    impls::CryptoImpl,
    traits::{Crypto, NodeManager, RpcManager},
    types::{NodeId, NodeRole, NodeStatus, Request, Response, RpcProvider},
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::{filter, prelude::*};
use uuid::Uuid;

/// Configuration for the exit node
#[derive(Debug, Clone, Deserialize)]
struct Config {
    /// The address to listen on
    listen_addr: SocketAddr,
    /// The region this node is in
    region: String,
    /// The coordinator node to register with
    coordinator_url: String,
}

/// Request body for circuit requests
#[derive(Debug, Clone, Deserialize)]
struct CircuitRequest {
    /// The encrypted request
    request: Request,
}

/// Response body for circuit responses
#[derive(Debug, Clone, Serialize)]
struct CircuitResponse {
    /// The encrypted response
    response: Response,
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

/// Mock implementation of the RpcManager trait
struct MockRpcManager {
    providers: Arc<RwLock<Vec<RpcProvider>>>,
}

impl MockRpcManager {
    fn new() -> Self {
        let mut providers = Vec::new();
        
        // Add some mock RPC providers
        providers.push(RpcProvider {
            id: Uuid::new_v4(),
            url: "https://api.mainnet-beta.solana.com".to_string(),
            provider_type: "solana".to_string(),
            active: true,
            success_rate: 0.99,
            avg_latency: Duration::from_millis(100),
            last_checked: SystemTime::now(),
        });
        
        providers.push(RpcProvider {
            id: Uuid::new_v4(),
            url: "https://solana-api.projectserum.com".to_string(),
            provider_type: "solana".to_string(),
            active: true,
            success_rate: 0.98,
            avg_latency: Duration::from_millis(120),
            last_checked: SystemTime::now(),
        });
        
        Self {
            providers: Arc::new(RwLock::new(providers)),
        }
    }
}

#[async_trait::async_trait]
impl RpcManager for MockRpcManager {
    async fn register_provider(&self, provider: RpcProvider) -> Result<()> {
        let mut providers = self.providers.write().await;
        providers.push(provider);
        Ok(())
    }
    
    async fn update_provider_status(&self, provider_id: Uuid, active: bool) -> Result<()> {
        let mut providers = self.providers.write().await;
        if let Some(provider) = providers.iter_mut().find(|p| p.id == provider_id) {
            provider.active = active;
        }
        Ok(())
    }
    
    async fn get_active_providers(&self) -> Result<Vec<RpcProvider>> {
        let providers = self.providers.read().await;
        Ok(providers.iter().filter(|p| p.active).cloned().collect())
    }
    
    async fn get_best_provider(&self) -> Result<Option<RpcProvider>> {
        let providers = self.providers.read().await;
        let active_providers: Vec<_> = providers.iter().filter(|p| p.active).collect();
        
        if active_providers.is_empty() {
            return Ok(None);
        }
        
        // Find the provider with the highest success rate
        let best_provider = active_providers
            .iter()
            .max_by(|a, b| a.success_rate.partial_cmp(&b.success_rate).unwrap())
            .unwrap();
        
        Ok(Some((*best_provider).clone()))
    }
}

/// Handler for circuit requests
async fn handle_circuit_request(
    Json(request): Json<CircuitRequest>,
    Extension(service): Extension<Arc<ExitNodeService>>,
) -> Result<Json<CircuitResponse>, StatusCode> {
    // Process the request
    let response = service
        .handle_request(&request.request)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(CircuitResponse { response }))
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
        listen_addr: "127.0.0.1:3002".parse()?,
        region: "us-east".to_string(),
        coordinator_url: "http://localhost:3001".to_string(),
    };
    
    info!("Starting exit node in region {}", config.region);
    
    // Create dependencies
    let crypto: Arc<dyn Crypto + Send + Sync> = Arc::new(CryptoImpl);
    let node_manager: Arc<dyn NodeManager + Send + Sync> = Arc::new(MockNodeManager::new());
    let rpc_manager: Arc<dyn RpcManager + Send + Sync> = Arc::new(MockRpcManager::new());
    
    // Create the exit node service
    let service = Arc::new(ExitNodeService::new(
        NodeId(Uuid::new_v4()),
        crypto,
        rpc_manager,
    ));
    
    // Create the router
    let app = Router::new()
        .route("/", post(handle_circuit_request))
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
