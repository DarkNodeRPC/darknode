//! DarkNode Entry Node
//!
//! This binary implements an entry node in the DarkNode network.
//! Entry nodes are the first point of contact for users and are responsible for:
//! 1. Validating API keys
//! 2. Sanitizing requests to remove identifying information
//! 3. Creating and managing circuits through the network
//! 4. Encrypting requests for the circuit
//! 5. Decrypting responses from the circuit

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use darknode_backend::{
    entry_node::EntryNodeService,
    impls::CryptoImpl,
    traits::{Crypto, NodeManager, RequestSanitizer, Router as RouterTrait, UserManager},
    types::{NodeId, NodeRole, NodeStatus},
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::{filter, prelude::*};
use uuid::Uuid;

/// Configuration for the entry node
#[derive(Debug, Clone, Deserialize)]
struct Config {
    /// The address to listen on
    listen_addr: SocketAddr,
    /// The region this node is in
    region: String,
    /// The coordinator node to register with
    coordinator_url: String,
}

/// Request body for RPC requests
#[derive(Debug, Clone, Deserialize)]
struct RpcRequest {
    /// The API key for authentication
    api_key: String,
    /// The RPC method to call
    method: String,
    /// The parameters for the RPC method
    params: Vec<serde_json::Value>,
    /// The JSON-RPC ID
    id: serde_json::Value,
}

/// Response body for RPC requests
#[derive(Debug, Clone, Serialize)]
struct RpcResponse {
    /// The JSON-RPC ID
    id: serde_json::Value,
    /// The result of the RPC call
    result: Option<serde_json::Value>,
    /// The error, if any
    error: Option<serde_json::Value>,
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

/// Mock implementation of the Router trait
struct MockRouter {
    crypto: Arc<dyn Crypto + Send + Sync>,
}

impl MockRouter {
    fn new(crypto: Arc<dyn Crypto + Send + Sync>) -> Self {
        Self { crypto }
    }
}

#[async_trait::async_trait]
impl RouterTrait for MockRouter {
    async fn create_circuit(&self) -> Result<darknode_backend::types::Circuit> {
        // Create a mock circuit
        let entry_node = NodeId(Uuid::new_v4());
        let routing_nodes = vec![NodeId(Uuid::new_v4()), NodeId(Uuid::new_v4())];
        let exit_node = NodeId(Uuid::new_v4());

        // Generate mock symmetric keys
        let mut symmetric_keys = Vec::new();
        for _ in 0..routing_nodes.len() + 2 {
            let (public_key, _) = self.crypto.generate_keypair().await?;
            symmetric_keys.push(public_key);
        }

        Ok(darknode_backend::types::Circuit {
            id: darknode_backend::types::CircuitId(Uuid::new_v4()),
            entry_node,
            routing_nodes,
            exit_node,
            symmetric_keys,
            created_at: std::time::SystemTime::now(),
            expires_at: std::time::SystemTime::now() + Duration::from_secs(3600),
        })
    }

    async fn send_request(
        &self,
        _circuit: &darknode_backend::types::Circuit,
        _request: &[u8],
    ) -> Result<Uuid> {
        // Generate a mock request ID
        Ok(Uuid::new_v4())
    }

    async fn receive_response(&self, _request_id: Uuid) -> Result<Vec<u8>> {
        // Generate a mock response
        Ok(serde_json::to_vec(&serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "result": "0x123456"
        }))?)
    }
}

/// Mock implementation of the RequestSanitizer trait
struct MockRequestSanitizer;

#[async_trait::async_trait]
impl RequestSanitizer for MockRequestSanitizer {
    async fn sanitize_request(&self, request: &[u8]) -> Result<Vec<u8>> {
        // In a real implementation, this would remove identifying information
        // For simplicity, we'll just return the request as-is
        Ok(request.to_vec())
    }

    async fn prepare_response(&self, response: &[u8]) -> Result<Vec<u8>> {
        // In a real implementation, this would prepare the response for delivery
        // For simplicity, we'll just return the response as-is
        Ok(response.to_vec())
    }
}

/// Mock implementation of the UserManager trait
struct MockUserManager {
    users: Arc<RwLock<Vec<darknode_backend::types::User>>>,
}

impl MockUserManager {
    fn new() -> Self {
        Self {
            users: Arc::new(RwLock::new(Vec::new())),
        }
    }
}

#[async_trait::async_trait]
impl UserManager for MockUserManager {
    async fn create_user(&self, wallet_address: &str) -> Result<darknode_backend::types::User> {
        let user = darknode_backend::types::User {
            id: Uuid::new_v4(),
            wallet_address: wallet_address.to_string(),
            api_key: format!("api-{}", Uuid::new_v4()),
            active: true,
            expires_at: None,
            rpc_mappings: Vec::new(),
        };

        let mut users = self.users.write().await;
        users.push(user.clone());

        Ok(user)
    }

    async fn get_user_by_api_key(&self, api_key: &str) -> Result<Option<darknode_backend::types::User>> {
        let users = self.users.read().await;
        Ok(users.iter().find(|u| u.api_key == api_key).cloned())
    }

    async fn get_user_by_wallet(&self, wallet_address: &str) -> Result<Option<darknode_backend::types::User>> {
        let users = self.users.read().await;
        Ok(users
            .iter()
            .find(|u| u.wallet_address == wallet_address)
            .cloned())
    }

    async fn add_rpc_mapping(
        &self,
        user_id: Uuid,
        mapping: darknode_backend::types::RpcMapping,
    ) -> Result<()> {
        let mut users = self.users.write().await;
        if let Some(user) = users.iter_mut().find(|u| u.id == user_id) {
            user.rpc_mappings.push(mapping);
        }
        Ok(())
    }

    async fn get_rpc_mappings(&self, user_id: Uuid) -> Result<Vec<darknode_backend::types::RpcMapping>> {
        let users = self.users.read().await;
        if let Some(user) = users.iter().find(|u| u.id == user_id) {
            Ok(user.rpc_mappings.clone())
        } else {
            Ok(Vec::new())
        }
    }
}

/// Handler for RPC requests
async fn handle_rpc(
    Json(request): Json<RpcRequest>,
    Extension(service): Extension<Arc<EntryNodeService>>,
) -> Result<Json<RpcResponse>, StatusCode> {
    // Convert the request to JSON
    let request_json = serde_json::to_vec(&serde_json::json!({
        "jsonrpc": "2.0",
        "method": request.method,
        "params": request.params,
        "id": request.id
    }))
    .map_err(|_| StatusCode::BAD_REQUEST)?;

    // Process the request
    let response_bytes = service
        .handle_request(&request.api_key, &request_json)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Parse the response
    let response: serde_json::Value =
        serde_json::from_slice(&response_bytes).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Extract the result and error
    let id = response["id"].clone();
    let result = if response["result"].is_null() {
        None
    } else {
        Some(response["result"].clone())
    };
    let error = if response["error"].is_null() {
        None
    } else {
        Some(response["error"].clone())
    };

    Ok(Json(RpcResponse { id, result, error }))
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
        listen_addr: "127.0.0.1:3000".parse()?,
        region: "us-east".to_string(),
        coordinator_url: "http://localhost:3001".to_string(),
    };

    info!("Starting entry node in region {}", config.region);

    // Create dependencies
    let crypto: Arc<dyn Crypto + Send + Sync> = Arc::new(CryptoImpl);
    let node_manager: Arc<dyn NodeManager + Send + Sync> = Arc::new(MockNodeManager::new());
    let router: Arc<dyn RouterTrait + Send + Sync> = Arc::new(MockRouter::new(crypto.clone()));
    let sanitizer: Arc<dyn RequestSanitizer + Send + Sync> = Arc::new(MockRequestSanitizer);
    let user_manager: Arc<dyn UserManager + Send + Sync> = Arc::new(MockUserManager::new());

    // Create the entry node service
    let service = Arc::new(EntryNodeService::new(
        NodeId(Uuid::new_v4()),
        crypto,
        router,
        sanitizer,
        user_manager,
    ));

    // Create the router
    let app = Router::new()
        .route("/", post(handle_rpc))
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
