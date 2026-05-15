import React from "react";
import ServerError from "../pages/ServerError";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI ERROR:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerError />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;