import { type Component } from "solid-js";

import styles from "./App.module.css";
import { Sketch } from "./components/Sketch";
import { io } from "socket.io-client";

const App: Component = () => {
  const socket = io("ws://172.20.10.2:8080");

  return (
    <div class={styles.App}>
      <Sketch socket={socket} />
    </div>
  );
};

export default App;
