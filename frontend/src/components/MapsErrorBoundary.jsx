import { Component } from 'react'

// Google Maps code can throw while rendering (for example with an invalid API key).
// Without this boundary React would unmount the whole page; now only the map or form
// is replaced by a message, and the total and run history keep working.
// React only supports error boundaries as class components.
class MapsErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

export default MapsErrorBoundary
