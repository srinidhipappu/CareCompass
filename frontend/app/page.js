"use client";
import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  useEffect(() => {
    axios.get("http://localhost:5000")
      .then(res => console.log(res.data));
  }, []);

  return <h1>CareCompass AI</h1>;
}