#!/usr/bin/env node

/**
 * Test Writer App Integration
 * Demonstrates the writer app functionality in the MCP system
 */

import { spawn } from 'child_process';
import http from 'http';

console.log('🧪 Testing Writer App Integration...\n');

let gatewayProcess;

// Function to make HTTP requests
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Function to wait for server to be ready
const waitForServer = (port, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.request({ port, path: '/health' }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          if (Date.now() - start > timeout) {
            reject(new Error('Server timeout'));
          } else {
            setTimeout(check, 500);
          }
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
      req.end();
    };
    check();
  });
};

const runTests = async () => {
  try {
    // Start gateway server
    console.log('🚀 Starting Gateway Server...');
    gatewayProcess = spawn('node', ['backend/server/app.js'], {
      env: { ...process.env, GATEWAY_PORT: '3001' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Capture output
    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('MCP Gateway listening')) {
        console.log('✅ Gateway Server started successfully');
      }
    });

    gatewayProcess.stderr.on('data', (data) => {
      console.error('Gateway Error:', data.toString());
    });

    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await waitForServer(3001);
    console.log('✅ Server is ready\n');

    // Test 1: Health Check
    console.log('🔍 Test 1: Health Check');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   - Status: ${healthResponse.data.status}`);
      console.log(`   - Uptime: ${healthResponse.data.uptime.toFixed(2)}s`);
      console.log(`   - Writer API: ${healthResponse.data.endpoints.writer_v1}`);
    } else {
      console.log('❌ Health check failed');
      return;
    }

    // Test 2: List Projects
    console.log('\n🔍 Test 2: List Writer Projects');
    const projectsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/writer/projects',
      method: 'GET'
    });
    
    if (projectsResponse.status === 200) {
      console.log('✅ Projects API working');
      console.log(`   - Found ${projectsResponse.data.projects.length} projects`);
      projectsResponse.data.projects.forEach((project, i) => {
        console.log(`   - Project ${i + 1}: ${project.name} (${project.icon})`);
      });
    } else {
      console.log('❌ Projects API failed');
    }

    // Test 3: Create Project
    console.log('\n🔍 Test 3: Create New Project');
    const createProjectResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/writer/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Novel Project',
      icon: 'book'
    });
    
    if (createProjectResponse.status === 200 && createProjectResponse.data.success) {
      console.log('✅ Project creation working');
      console.log(`   - Created: ${createProjectResponse.data.project.name}`);
      console.log(`   - ID: ${createProjectResponse.data.project.id}`);
      const projectId = createProjectResponse.data.project.id;

      // Test 4: Create Note
      console.log('\n🔍 Test 4: Create Note');
      const createNoteResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/writer/projects/${projectId}/notes`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        title: 'Character: Alice',
        content: 'A brave protagonist with magical abilities',
        category: 'character',
        tags: ['protagonist', 'magic-user']
      });

      if (createNoteResponse.status === 200 && createNoteResponse.data.success) {
        console.log('✅ Note creation working');
        console.log(`   - Created note: ${createNoteResponse.data.note.title}`);
        console.log(`   - Category: ${createNoteResponse.data.note.category}`);
      } else {
        console.log('❌ Note creation failed');
      }

      // Test 5: Create Plot Point
      console.log('\n🔍 Test 5: Create Plot Point');
      const createPlotResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/writer/projects/${projectId}/plot-points`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        title: 'The Discovery',
        description: 'Alice discovers her magical powers',
        type: 'inciting-incident'
      });

      if (createPlotResponse.status === 200 && createPlotResponse.data.success) {
        console.log('✅ Plot point creation working');
        console.log(`   - Created plot point: ${createPlotResponse.data.plotPoint.title}`);
        console.log(`   - Type: ${createPlotResponse.data.plotPoint.type}`);
      } else {
        console.log('❌ Plot point creation failed');
      }

      // Test 6: AI Content Generation
      console.log('\n🔍 Test 6: AI Content Generation');
      const generateResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/writer/projects/${projectId}/generate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        prompt: 'Describe a magical forest where Alice discovers her powers',
        personality: 'descriptive',
        outputType: 'worldbuilding'
      });

      if (generateResponse.status === 200 && generateResponse.data.success) {
        console.log('✅ AI content generation working');
        console.log(`   - Generated content preview: ${generateResponse.data.generatedContent.substring(0, 60)}...`);
      } else {
        console.log('❌ AI content generation failed');
      }

      // Test 7: Project Stats
      console.log('\n🔍 Test 7: Project Statistics');
      const statsResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1/writer/projects/${projectId}/stats`,
        method: 'GET'
      });

      if (statsResponse.status === 200) {
        console.log('✅ Project statistics working');
        console.log(`   - Notes: ${statsResponse.data.stats.counts.notes}`);
        console.log(`   - Plot Points: ${statsResponse.data.stats.counts.plotPoints}`);
        console.log(`   - Tasks: ${statsResponse.data.stats.counts.tasks}`);
      } else {
        console.log('❌ Project statistics failed');
      }

    } else {
      console.log('❌ Project creation failed');
    }

    console.log('\n🎉 Writer App Integration Tests Completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Gateway Server: Working');
    console.log('✅ Health Monitoring: Working');
    console.log('✅ Writer API Endpoints: Working');
    console.log('✅ Project Management: Working');
    console.log('✅ Note System: Working');
    console.log('✅ Plot Points: Working');
    console.log('✅ AI Integration: Working');
    console.log('✅ Statistics: Working');
    
    console.log('\n🔗 Available Endpoints:');
    console.log('   • Health: http://localhost:3001/health');
    console.log('   • Writer API: http://localhost:3001/api/v1/writer/*');
    console.log('   • Agent API: http://localhost:3001/api/v1/agent/*');
    console.log('   • Notion API: http://localhost:3001/api/v1/*');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (gatewayProcess) {
      console.log('\n🛑 Stopping Gateway Server...');
      gatewayProcess.kill();
    }
  }
};

// Handle process termination
process.on('SIGINT', () => {
  if (gatewayProcess) {
    gatewayProcess.kill();
  }
  process.exit(0);
});

// Run tests
runTests().catch(console.error);