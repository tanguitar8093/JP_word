import React from 'react';
import { Link } from 'react-router-dom';

export default function ExamplePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>這是一個範例頁面</h1>
      <p>路由功能正常！</p>
      <Link to="/">返回測驗</Link>
    </div>
  );
}
