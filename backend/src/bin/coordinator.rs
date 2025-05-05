//! DarkNode Coordinator
//!
//! This binary implements a coordinator node in the DarkNode network.
//! Coordinator nodes are responsible for:
//! 1. Managing the network topology
//! 2. Monitoring the health of nodes
//! 3. Distributing routing information
//! 4. Monitoring RPC provider health
//! 5. Providing a dashboard for network administrators

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
    coordinator::CoordinatorService,
    impls::CryptoImpl,
    traits::{Crypto, NodeManager, RpcManager},
    types::{Node, NodeId, NodeRole, NodeStatus, RpcProvider},
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tower_http::trace::TraceLayer;
use tracing::{info, Level};
use tracing_subscriber::{filter, prelude::*};
use uuid::Uuid;

/// Configuration for the coordinator node
#[derive(Debug, Clone, Deserialize)]
struct Config {
    /// The address to listen on
    listen_addr: SocketAddr,
    /// The region this node is in
    region: String,
}

/// Request body for registering a node
#[derive(Debug, Clone, Deserialize)]
struct RegisterNodeRequest {
    /// The node to register
    node: Node,
}

/// Response body for registering a node
#[derive(Debug, Clone, Serialize)]
struct RegisterNodeResponse {
    /// Whether the registration was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Request body for updating a node's status
#[derive(Debug, Clone, Deserialize)]
struct UpdateNodeStatusRequest {
    /// The ID of the node to update
    node_id: NodeId,
    /// The new status of the node
    status: NodeStatus,
}

/// Response body for updating a node's status
#[derive(Debug, Clone, Serialize)]
struct UpdateNodeStatusResponse {
    /// Whether the update was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Request body for registering an RPC provider
#[derive(Debug, Clone, Deserialize)]
struct RegisterProviderRequest {
    /// The provider to register
    provider: RpcProvider,
}

/// Response body for registering an RPC provider
#[derive(Debug, Clone, Serialize)]
struct RegisterProviderResponse {
    /// Whether the registration was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Request body for updating an RPC provider's status
#[derive(Debug, Clone, Deserialize)]
struct UpdateProviderStatusRequest {
    /// The ID of the provider to update
    provider_id: Uuid,
    /// Whether the provider is active
    active: bool,
}

/// Response body for updating an RPC provider's status
#[derive(Debug, Clone, Serialize)]
struct UpdateProviderStatusResponse {
    /// Whether the update was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Response body for getting available nodes
#[derive(Debug, Clone, Serialize)]
struct GetAvailableNodesResponse {
    /// The available nodes
    nodes: Vec<Node>,
}

/// Response body for getting active providers
#[derive(Debug, Clone, Serialize)]
struct GetActiveProvidersResponse {
    /// The active providers
    providers: Vec<RpcProvider>,
}

/// Response body for getting the best provider
#[derive(Debug, Clone, Serialize)]
struct GetBestProviderResponse {
    /// The best provider, if any
    provider: Option<RpcProvider>,
}

/// Response body for updating the network topology
#[derive(Debug, Clone, Serialize)]
struct UpdateTopologyResponse {
    /// Whether the update was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Response body for checking RPC health
#[derive(Debug, Clone, Serialize)]
struct CheckRpcHealthResponse {
    /// Whether the check was successful
    success: bool,
    /// Error message, if any
    error: Option<String>,
}

/// Mock implementation of the NodeManager trait
struct MockNodeManager {
    nodes: Arc<RwLock<Vec<Node>>>,
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
    async fn register_node(&self, node: Node) -> Result<()> {
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

    async fn get_available_nodes(&self, role: NodeRole) -> Result<Vec<Node>> {
        let nodes = self.nodes.read().await;
        Ok(nodes
            .iter()
            .filter(|n| n.role == role && n.status == NodeStatus::Online)
            .cloned()
            .collect())
    }

    async fn get_node(&self, node_id: &NodeId) -> Result<Option<Node>> {
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

/// Handler for registering a node
async fn register_node(
    Json(request): Json<RegisterNodeRequest>,
    Extension(node_manager): Extension<Arc<dyn NodeManager + Send + Sync>>,
) -> Result<Json<RegisterNodeResponse>, StatusCode> {
    match node_manager.register_node(request.node).await {
        Ok(_) => Ok(Json(RegisterNodeResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(RegisterNodeResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for updating a node's status
async fn update_node_status(
    Json(request): Json<UpdateNodeStatusRequest>,
    Extension(node_manager): Extension<Arc<dyn NodeManager + Send + Sync>>,
) -> Result<Json<UpdateNodeStatusResponse>, StatusCode> {
    match node_manager.update_node_status(&request.node_id, request.status).await {
        Ok(_) => Ok(Json(UpdateNodeStatusResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(UpdateNodeStatusResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for getting available nodes
async fn get_available_nodes(
    Path(role): Path<NodeRole>,
    Extension(node_manager): Extension<Arc<dyn NodeManager + Send + Sync>>,
) -> Result<Json<GetAvailableNodesResponse>, StatusCode> {
    match node_manager.get_available_nodes(role).await {
        Ok(nodes) => Ok(Json(GetAvailableNodesResponse { nodes })),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Handler for registering an RPC provider
async fn register_provider(
    Json(request): Json<RegisterProviderRequest>,
    Extension(rpc_manager): Extension<Arc<dyn RpcManager + Send + Sync>>,
) -> Result<Json<RegisterProviderResponse>, StatusCode> {
    match rpc_manager.register_provider(request.provider).await {
        Ok(_) => Ok(Json(RegisterProviderResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(RegisterProviderResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for updating an RPC provider's status
async fn update_provider_status(
    Json(request): Json<UpdateProviderStatusRequest>,
    Extension(rpc_manager): Extension<Arc<dyn RpcManager + Send + Sync>>,
) -> Result<Json<UpdateProviderStatusResponse>, StatusCode> {
    match rpc_manager
        .update_provider_status(request.provider_id, request.active)
        .await
    {
        Ok(_) => Ok(Json(UpdateProviderStatusResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(UpdateProviderStatusResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for getting active providers
async fn get_active_providers(
    Extension(rpc_manager): Extension<Arc<dyn RpcManager + Send + Sync>>,
) -> Result<Json<GetActiveProvidersResponse>, StatusCode> {
    match rpc_manager.get_active_providers().await {
        Ok(providers) => Ok(Json(GetActiveProvidersResponse { providers })),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Handler for getting the best provider
async fn get_best_provider(
    Extension(rpc_manager): Extension<Arc<dyn RpcManager + Send + Sync>>,
) -> Result<Json<GetBestProviderResponse>, StatusCode> {
    match rpc_manager.get_best_provider().await {
        Ok(provider) => Ok(Json(GetBestProviderResponse { provider })),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Handler for updating the network topology
async fn update_topology(
    Extension(service): Extension<Arc<CoordinatorService>>,
) -> Result<Json<UpdateTopologyResponse>, StatusCode> {
    match service.update_topology().await {
        Ok(_) => Ok(Json(UpdateTopologyResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(UpdateTopologyResponse {
            success: false,
            error: Some(e.to_string()),
        })),
    }
}

/// Handler for checking RPC health
async fn check_rpc_health(
    Extension(service): Extension<Arc<CoordinatorService>>,
) -> Result<Json<CheckRpcHealthResponse>, StatusCode> {
    match service.check_rpc_health().await {
        Ok(_) => Ok(Json(CheckRpcHealthResponse {
            success: true,
            error: None,
        })),
        Err(e) => Ok(Json(CheckRpcHealthResponse {
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
        listen_addr: "127.0.0.1:3001".parse()?,
        region: "us-east".to_string(),
    };
    
    info!("Starting coordinator node in region {}", config.region);
    
    // Create dependencies
    let node_manager: Arc<dyn NodeManager + Send + Sync> = Arc::new(MockNodeManager::new());
    let rpc_manager: Arc<dyn RpcManager + Send + Sync> = Arc::new(MockRpcManager::new());
    
    // Create the coordinator service
    let service = Arc::new(CoordinatorService::new(
        node_manager.clone(),
        rpc_manager.clone(),
    ));
    
    // Create the router
    let app = Router::new()
        .route("/nodes", post(register_node))
        .route("/nodes/status", post(update_node_status))
        .route("/nodes/available/:role", get(get_available_nodes))
        .route("/providers", post(register_provider))
        .route("/providers/status", post(update_provider_status))
        .route("/providers/active", get(get_active_providers))
        .route("/providers/best", get(get_best_provider))
        .route("/topology/update", post(update_topology))
        .route("/rpc/health", post(check_rpc_health))
        .route("/health", get(health_check))
        .layer(TraceLayer::new_for_http())
        .layer(Extension(node_manager))
        .layer(Extension(rpc_manager))
        .layer(Extension(service));
    
    // Start the server
    info!("Listening on {}", config.listen_addr);
    axum::Server::bind(&config.listen_addr)
        .serve(app.into_make_service())
        .await?;
    
    Ok(())
}
