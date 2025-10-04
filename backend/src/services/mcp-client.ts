/**
 * Central Model Context Protocol (MCP) Client
 *
 * This client is responsible for managing connections to all MCP servers
 * in the project (mcp-notion, mcp-ashval, mcp-graphicai) and providing a
 * unified interface for calling their tools via JSON-RPC.
 */

import { McpClient, StdioClientTransport, SocketClientTransport } from "@modelcontextprotocol/sdk/client";
import { ChildProcess, spawn } from 'child_process';
import path from 'path';

interface McpServerConfig {
    name: string;
    type: 'stdio' | 'socket';
    command?: string; // For stdio
    args?: string[];   // For stdio
    host?: string;     // For socket
    port?: number;     // For socket
    cwd?: string;
}

interface McpServerConnection {
    config: McpServerConfig;
    client: McpClient;
    transport: StdioClientTransport | SocketClientTransport;
    process?: ChildProcess; // For stdio servers
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    error?: Error;
}

const SERVER_CONFIGS: McpServerConfig[] = [
    {
        name: 'notion',
        type: 'stdio',
        command: 'node',
        args: ['build/index.js'],
        cwd: path.resolve(process.cwd(), 'backend'),
    },
    {
        name: 'enhanced',
        type: 'stdio',
        command: 'node',
        args: ['build/enhanced-server.js'],
        cwd: path.resolve(process.cwd(), 'backend'),
    },
    {
        name: 'graphicai',
        type: 'socket',
        host: 'localhost',
        port: Number(process.env.GRAPHICAI_PORT) || 5001,
        command: 'node', // Command to start this server if it's not already running
        args: ['build/index.js'],
        cwd: path.resolve(process.cwd(), 'GraphicAI'),
    }
];


export class CentralMcpClient {
    private servers: Map<string, McpServerConnection> = new Map();

    constructor() {
        SERVER_CONFIGS.forEach(config => {
            const client = new McpClient();
            this.servers.set(config.name, {
                config,
                client,
                transport: null as any, // Will be initialized in connect
                status: 'disconnected'
            });
        });
    }

    /**
     * Initializes connections to all configured MCP servers.
     */
    async connectAll(): Promise<void> {
        console.log("Connecting to all MCP servers...");
        const connectionPromises = Array.from(this.servers.keys()).map(name => this.connect(name));
        await Promise.all(connectionPromises);
        console.log("All MCP server connection attempts finished.");
    }

    /**
     * Connects to a single MCP server by name.
     * @param serverName The name of the server to connect to.
     */
    private async connect(serverName: string): Promise<void> {
        const connection = this.servers.get(serverName);
        if (!connection) throw new Error(`Server config for '${serverName}' not found.`);

        if (connection.status === 'connected' || connection.status === 'connecting') {
            return;
        }

        console.log(`Connecting to ${serverName}...`);
        connection.status = 'connecting';

        try {
            if (connection.config.type === 'stdio') {
                const { command, args, cwd } = connection.config;
                if (!command) throw new Error(`'command' is required for stdio server '${serverName}'`);

                const childProcess = spawn(command, args || [], { cwd, stdio: 'pipe' });
                connection.process = childProcess;

                childProcess.stderr?.on('data', (data) => console.error(`[${serverName} STDERR]: ${data.toString()}`));
                childProcess.on('close', (code) => {
                    console.log(`[${serverName}] process exited with code ${code}`);
                    connection.status = 'disconnected';
                });

                connection.transport = new StdioClientTransport(childProcess.stdin, childProcess.stdout);
            } else if (connection.config.type === 'socket') {
                const { host, port } = connection.config;
                if (!host || !port) throw new Error(`'host' and 'port' are required for socket server '${serverName}'`);
                connection.transport = new SocketClientTransport({ host, port });
            }

            await connection.client.connect(connection.transport);
            connection.status = 'connected';
            console.log(`✅ Successfully connected to ${serverName}.`);
        } catch (error: any) {
            connection.status = 'error';
            connection.error = error;
            console.error(`❌ Failed to connect to ${serverName}:`, error.message);
        }
    }

    /**
     * Disconnects from all MCP servers and terminates child processes.
     */
    async disconnectAll(): Promise<void> {
        console.log("Disconnecting from all MCP servers...");
        for (const connection of this.servers.values()) {
            try {
                if (connection.status === 'connected') {
                    await connection.client.disconnect();
                }
                if (connection.process) {
                    connection.process.kill('SIGTERM');
                }
                connection.status = 'disconnected';
            } catch(e) {
                console.error(`Error disconnecting from ${connection.config.name}:`, e);
                connection.status = 'error';
                connection.error = e as Error;
            }
        }
        console.log("All MCP servers disconnected.");
    }

    /**
     * Calls a tool on a specific MCP server.
     * @param serverName The name of the MCP server (e.g., 'notion', 'graphicai').
     * @param toolName The name of the tool to call.
     * @param args The arguments for the tool.
     * @returns The result from the tool call.
     */
    async callTool(serverName: string, toolName: string, args: Record<string, any>): Promise<any> {
        console.log(`Calling tool '${toolName}' on server '${serverName}' with args:`, args);

        const connection = this.servers.get(serverName);
        if (!connection) {
            throw new Error(`Server '${serverName}' not found.`);
        }

        if (connection.status !== 'connected') {
            // Optional: Attempt to connect if not already connected
            console.warn(`Server '${serverName}' is not connected. Attempting to connect...`);
            await this.connect(serverName);
            if (connection.status !== 'connected') {
                 throw new Error(`Failed to connect to server '${serverName}': ${connection.error?.message}`);
            }
        }

        try {
            const result = await connection.client.call(toolName, args);
            console.log(`Tool '${toolName}' on '${serverName}' executed successfully.`);
            return result;
        } catch (error) {
            console.error(`Error calling tool '${toolName}' on server '${serverName}':`, error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }

    /**
     * Gets the status of all configured MCP servers.
     * @returns A map of server names to their connection status.
     */
    getStatus(): Record<string, string> {
        const statusReport: Record<string, string> = {};
        this.servers.forEach((conn, name) => {
            statusReport[name] = conn.status;
        });
        return statusReport;
    }
}

// Export a singleton instance of the client
export const mcpClient = new CentralMcpClient();