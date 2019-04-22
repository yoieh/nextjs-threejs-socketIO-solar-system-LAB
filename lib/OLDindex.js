import { Component } from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";

class ChatOne extends Component {
  // fetch old packages data from the server
  static async getInitialProps({ req }) {
    const response = await fetch("http://localhost:3000/packages/chat1");
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
      this.props.socket.on("message.chat1", this.handleMessage);
      this.setState({ subscribed: true });
    }
  };

  componentDidMount() {
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
    this.props.socket.off("message.chat1", this.handleMessage);
  }

  // add packages from server to the state
  handleMessage = message => {
    this.setState(state => ({ packages: state.packages.concat(message) }));
  };

  handleChange = event => {
    this.setState({ field: event.target.value });
  };

  // send packages to server and add them to the state
  handleSubmit = event => {
    event.preventDefault();

    // create message object
    const message = {
      id: new Date().getTime(),
      value: this.state.field
    };

    // send object to WS server
    this.props.socket.emit("message.chat1", message);

    // add it to state and clean current input value
    this.setState(state => ({
      field: "",
      packages: state.packages.concat(message)
    }));
  };

  render() {
    return (
      <main>
        <div>
          <Link href={"/"}>
            <a>{"Chat One"}</a>
          </Link>
          <ul>
            {this.state.packages.map(message => (
              <li key={message.id}>{message.value}</li>
            ))}
          </ul>
          <form onSubmit={e => this.handleSubmit(e)}>
            <input
              onChange={this.handleChange}
              type="text"
              placeholder="Hello world!"
              value={this.state.field}
            />
            <button>Send</button>
          </form>
        </div>
      </main>
    );
  }
}

export default ChatOne;
