import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css"; // Tailwind CSS directives

// 1. Initialize QueryClient for optimized data caching (Fast Load)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents unnecessary re-renders
      retry: 1,
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Routing Provider */}
    <BrowserRouter>
      {/* 3. Performance & Caching Provider */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
