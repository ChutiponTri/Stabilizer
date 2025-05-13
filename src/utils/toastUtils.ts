import toast from "react-hot-toast";

export const warning = (msg: string) => {
  toast(msg, {
    icon: "⚠️",
    style: {
      background: "#fff8db",
      color: "#a76d00",
      border: "1px solid #f5d473",
    },
  });
};