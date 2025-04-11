import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // 确保 index.css 存在

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("未找到 root 元素，请检查 index.html 是否包含 <div id='root'></div>");
} else {
  ReactDOM.createRoot(rootElement as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
