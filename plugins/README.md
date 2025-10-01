# Plugin System

The Item Analyzer supports extensible plugins for custom analysis, integrations, and features.

## How to Create a Plugin

1. Create a plugin file in the `plugins/` directory
2. Export a function that takes `env` and returns plugin hooks
3. Hooks can include:
   - `preAnalyze`: Run before analysis
   - `postAnalyze`: Run after analysis
   - `customEndpoint`: Add custom API endpoints

## Example Plugin

```javascript
export default function myPlugin(env) {
  return {
    preAnalyze: async (data) => {
      // Custom preprocessing
      return data;
    },
    postAnalyze: async (result) => {
      // Custom post-processing
      return result;
    },
    customEndpoint: {
      path: '/api/my-plugin',
      handler: async (request) => {
        return new Response('Hello from plugin');
      }
    }
  };
}
```

## Loading Plugins

Plugins are loaded dynamically in the worker.