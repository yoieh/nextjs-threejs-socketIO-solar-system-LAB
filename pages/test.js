import fetch from "isomorphic-unfetch";

import { drawCanvasMap } from "../lib/newVoronoi";
// import geoVoronoiData, { smallData } from "../data/geoVoronoiData";
import display, { updateTile } from "../lib/display";

export default class Test extends React.Component {
  // fetch old messages data from the server
  static async getInitialProps({ req }) {
    // const response = await fetch("http://localhost:3000/game/map/data");
    const response = await fetch("http://localhost:3000/game/map/data");
    const messages = await response.json();
    return { messages };
  }

  static defaultProps = {
    messages: []
  };

  // init state with the prefetched messages
  state = {
    field: "",
    newMessage: 0,
    messages: this.props.messages,
    subscribe: false,
    subscribed: false
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("game.map.tile.update", this.handleMessage);
      this.setState({ subscribed: true });
      display(window, this.state.messages, this.props.socket);
    }
  };

  componentDidMount() {
    console.clear();
    this.subscribe();
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // close socket connection
  componentWillUnmount() {
    this.props.socket.off("game.map.data", this.handleMessage);
  }

  // add messages from server to the state
  handleMessage = message => {
    console.log(message);
    updateTile(message);
  };

  handleChange = event => {
    this.setState({ field: event.target.value });
  };

  render() {
    return <div className="hello" />;
  }
}
