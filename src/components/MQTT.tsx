"use client";

import { getDevice } from "@/actions/data.action";
import mqtt, { MqttClient } from "mqtt";

class MQTT {
  client!: MqttClient;
  callback: (data: any) => void;
  startCallback: (flag: boolean) => void;
  data_topic: string = "";
  cmd_topic: string = "";
  start_topic: string = "";
  pair_topic: string;
  dev_topic: string;
  dev_name:  string = "";
  isInitialized: boolean = false;

  constructor(
    dataCallback: (data: any) => void, 
    startCallback: (flag: boolean) => void
  ) {
    this.data_topic = process.env.NEXT_PUBLIC_DATA_TOPIC || "undefined";
    this.cmd_topic = process.env.NEXT_PUBLIC_CMD_TOPIC || "undefined";
    this.pair_topic = process.env.NEXT_PUBLIC_PAIR_TOPIC || "undefined";
    this.dev_topic = process.env.NEXT_PUBLIC_DEV_TOPIC || "undefined";
    this.start_topic = process.env.NEXT_PUBLIC_START_TOPIC || "undefined";
    if ( this.pair_topic === "undefined" || this.dev_topic === "undefined") throw new Error("MQTT Topic not found");
    
    this.callback = dataCallback;
    this.startCallback = startCallback;
    this.connectMQTT();
    this.init();
  }

  async init() {
    const response = await getDevice();
    if (response && typeof response === "object" && "device" in response) {
      const newDevName = response.device;
      if (newDevName && newDevName !== this.dev_name) {
        this.dev_name = newDevName;
        const newDataTopic = `${process.env.NEXT_PUBLIC_DATA_TOPIC}/${this.dev_name}`;
        const newCmdTopic = `${process.env.NEXT_PUBLIC_CMD_TOPIC}/${this.dev_name}`;
        const newStartTopic = `${process.env.NEXT_PUBLIC_START_TOPIC}/${this.dev_name}`;

        // Unsubscribe old topics if already initialized
        if (this.isInitialized && this.data_topic && this.cmd_topic) {
          this.client.unsubscribe(this.data_topic);
          this.client.unsubscribe(this.cmd_topic);
          this.client.unsubscribe(this.start_topic);
        }

        // Update topics and subscribe
        this.data_topic = newDataTopic;
        this.cmd_topic = newCmdTopic;
        this.start_topic = newStartTopic;
        this.subscribeToDynamicTopics();
        console.log("Start Topic ->", this.start_topic);

        this.isInitialized = true;
      }
    }
  }

  connectMQTT() {
    const clientId = "tchutipon-" + Math.floor(Math.random() * 0xffff).toString();
    const broker = "broker.emqx.io";
    const port = 8084;
    const url = `wss://${broker}:${port}/mqtt`;

    this.client = mqtt.connect(url, {
      clientId,
      clean: true,
      connectTimeout: 4000
    });

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.client.subscribe(this.pair_topic, this.handleSubResult("Pair"));
      this.client.subscribe(this.dev_topic, this.handleSubResult("Device"));
    });
    this.client.on("message", this.onMessageArrived.bind(this));
    this.client.on("error", (error) => console.error("MQTT Error:", error));
    this.client.on("close", () => console.warn("MQTT Connection Closed"));
  }

  private subscribeToDynamicTopics() {
    this.client.subscribe(this.data_topic, this.handleSubResult("Data"));
    this.client.subscribe(this.cmd_topic, this.handleSubResult("Command"));
    this.client.subscribe(this.start_topic, this.handleSubResult("Start"));
  }

  private handleSubResult(name: string) {
    return (err: Error | null) => {
      if (err) {
        console.error(`Subscription to ${name} Topic failed:`, err);
      } else {
        console.log(`Subscribed to ${name} Topic successfully`);
      }
    };
  }

  onMessageArrived(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());
      if (topic === this.data_topic && payload.pressure !== undefined) {
        this.callback(payload);
      } else if (topic === this.dev_topic && payload.device !== undefined) {
        console.log("Device updated from broker:", payload);
        this.callback(payload);
      } else if (topic === this.start_topic && payload.start === 1) {
        console.log("Start flag from Device:", payload);
        this.startCallback(payload.start);
      }  else if (topic === this.start_topic) {
        console.log("Start Flag Trouble Test:", payload);
        console.log(payload.start, typeof payload.start);
      } 
    } catch (error) {
      console.error("Failed to parse MQTT message:", error);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      console.log("Disconnected from MQTT broker");
    }
  }

  publish(pressure: number, mode: string) {
    if (this.client?.connected) {
      const payload = {
        message: "ok",
        pressure: pressure,
        mode: mode
      }
      this.client.publish(this.cmd_topic, JSON.stringify(payload));
    }
  }

  pair() {
    if (this.client?.connected) {
      const payload = {
        message: "Pair Request",
      }
      this.client.publish(this.pair_topic, JSON.stringify(payload));
    }
  }

}

export default MQTT