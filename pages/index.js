import fetch from "isomorphic-unfetch";
import threeEntryPoint from "../threejs/threeEntryPoint";

import { drawCanvasMap } from "../lib/newVoronoi";
// import geoVoronoiData, { smallData } from "../data/geoVoronoiData";
// import display, { updateTile, updatePlantsPositions } from "../lib/display";

export default class Test extends React.Component {
  // fetch old packages data from the server
  static async getInitialProps({ req }) {
    // const response = await fetch("http://localhost:3000/game/map/data");
    const response = await fetch("http://localhost:3000/game/map/data");
    const packages = await response.json();
    return { packages };
  }

  static defaultProps = {
    packages: []
  };

  // init state with the prefetched packages
  state = {
    field: "",
    newMessage: 0,
    packages: this.props.packages,
    subscribe: false,
    subscribed: false
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      // connect to WS server and listen event
      this.props.socket.on("game.map.tile.update", this.handleMessage);
      this.props.socket.on("game.map.planets.position", this.updatePlants);

      this.setState({ subscribed: true });
      // display(window, this.state.packages, this.props.socket);
    }
  };

  componentDidMount() {
    console.clear();
    this.subscribe();
    this.setState({
      threeUpdate: threeEntryPoint(this.threeRootElement, this.state.packages)
    });
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // // close socket connection
  componentWillUnmount() {
    this.props.socket.off("game.map.tile.update", () => {});
    this.props.socket.off("game.map.planets.position", () => {});
  }

  // // add packages from server to the state
  handleMessage = message => {
    console.log(message);
  };

  updatePlants = message => {
    // updatePlantsPositions(message);
    this.state.threeUpdate.update(message);
  };

  // handleChange = event => {
  //   this.setState({ field: event.target.value });
  // };

  render() {
    return <div ref={element => (this.threeRootElement = element)} />;
  }
}
