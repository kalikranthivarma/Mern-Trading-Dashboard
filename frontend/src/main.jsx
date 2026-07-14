import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import { store, persistor } from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000, // React Query v5
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);