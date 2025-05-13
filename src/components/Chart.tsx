"use client"

import * as React from "react"
import { PieChart, Pie, Label as PieLabel, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MQTT from "./MQTT"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "./ui/button"
import { queryCustomers } from "@/actions/user.action"
import { getDevice, saveDevice, storeData } from "@/actions/data.action"
import { warning } from "@/utils/toastUtils"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "./ui/label";
import { Input } from "./ui/input"

const maxPressure = 100;
const initialMode = [
  { label: "Cervical", min: 20, max: 30, fill: "var(--color-cervical)" },
  { label: "Thoracic", min: 30, max: 40, fill: "var(--color-thoracic)" },
  { label: "Lumbar", min: 40, max: 50, fill: "var(--color-lumbar)" },
  { label: "Custom", min: 20, max: 50, fill: "var(--color-custom)" }
]

type Modes = { label: string, min: number, max: number, fill: string }

export type PressureData = {
  pressure: number;
  timestamp: string;
  start?: string;     // Optional start time
  patient?: string;   // Optional patient ID or name
  mode?: string;
};

type TimeData = {
  label: string;
  current: number;
  fill: string;
}

interface PageProps {
  params: {
    mode: string;
    id: string;
  }
}

function Chart({ params }: PageProps) {
  const activeLabel = params.mode.charAt(0).toUpperCase() + params.mode.toLowerCase().slice(1);
  const patientId = params.id;

  const [timer, setInitTimer] = React.useState<number>(10);
  const [isClient, setIsClient] = React.useState(false);
  const [pressure, setPressure] = React.useState<{ pressure: number; timestamp?: string }>({ pressure: 25 });
  const [pressureData, setData] = React.useState<{ pressure: number; timestamp: string }[]>([]);
  const [flag, setFlag] = React.useState(false);
  const [startTime, setTime] = React.useState<string | undefined>(undefined);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [devices, setDevices] = React.useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = React.useState<string | null>(null);
  const [activeDevice, setActiveDevice] = React.useState<string | undefined>(undefined);
  const [fetchingDevice, setFetchingDevice] = React.useState<boolean>(true);
  const [isFinish, setIsFinish] = React.useState<boolean>(false);
  const [isCustom, setIsCustom] = React.useState<boolean>(false);
  const [modes, setModes] = React.useState(initialMode);

  const mqttRef = React.useRef<MQTT | null>(null);
  const flagRef = React.useRef(flag);
  const startTimeRef = React.useRef(startTime);

  React.useEffect(() => {
    flagRef.current = flag;                     // Update ref when flag changes
  }, [flag]);
  React.useEffect(() => {
    startTimeRef.current = startTime;           // Update ref when startTime changes
  }, [startTime]);

  React.useEffect(() => {
    const fetchDevice = async () => {
      try {
        setFetchingDevice(true);
        const device = await getDevice() || undefined;
        console.log(device);
        if (device && typeof device === "object" && "device" in device) {
          setActiveDevice(device.device);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFetchingDevice(false);
      }
    }
    fetchDevice();
  }, [selectedDevice]);

  React.useEffect(() => {
    setIsClient(true);
    const fetchPatient = async () => {
      try {
        const patient = await queryCustomers(patientId);
        if (!patient) {
          const router = useRouter();
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchPatient();
  }, []);

  const activeMode = modes.find((mode) => mode.label === activeLabel);
  const minAngle = activeMode ? 90 - activeMode.min * 3.6 : 90;
  const maxAngle = activeMode ? 90 - activeMode.max * 3.6 : 90;

  const safePressure = Math.min(Math.max(pressure.pressure, 0), maxPressure);
  const inRange = activeMode && safePressure >= activeMode.min && safePressure <= activeMode.max;
  const overMax = activeMode && safePressure > activeMode.max;

  const gaugeColor = overMax
    ? "#EF4444"     // red-500 (suitable for both themes)
    : inRange
      ? "#10B981"   // green-500 (suitable for both themes)
      : "#F59E0B";  // amber-500, for below min (optional)
  const data = [
    { name: "Pressure", value: safePressure, fill: gaugeColor },
    { name: "Remaining", value: maxPressure - safePressure, fill: "#ddd" },
  ]

  React.useEffect(() => {
    const dataCallback = async (data: { pressure?: number; device?: string }) => {
      if ("pressure" in data && typeof data.pressure === "number" && flagRef.current) {
        const newTimestamp = new Date().toLocaleString();
        let newData: PressureData = { pressure: data.pressure, timestamp: newTimestamp };
        // setData((prevData) => [...prevData, newData]);
        setData((prevData) => {
          const updatedData = [...prevData, newData];

          // Ensure the total length does not exceed 200 by dropping the oldest entries
          return updatedData.length > 5 ? updatedData.slice(updatedData.length - 10) : updatedData;
        });
        setPressure(newData);
        newData.start = startTimeRef.current;
        newData.patient = patientId;
        newData.mode = activeLabel;
        const response = await storeData(newData);
        console.log(response);
      } else if ("device" in data && typeof data.device === "string") {
        setDevices((prevData) => {
          if (!prevData.includes(data.device!)) {
            return [...prevData, data.device!];
          }
          return prevData;
        });
        console.log("Paired with device:", data.device);
      }
    };

    const mqttClient = new MQTT(dataCallback);
    mqttRef.current = mqttClient;
    return () => {
      // Clean up MQTT client
    };
  }, []);

  React.useEffect(() => {
    if (!isClient || !activeLabel || !mqttRef.current) return;
    const initMQTT = async () => {
      if (!showEditDialog && mqttRef.current) {
        await mqttRef.current.init(); // This initializes the MQTT connection and subscribes.
      }
    };

    initMQTT();
    return () => { }
  }, [showEditDialog])

  const publish = () => {
    if (!isClient || !activeLabel || !mqttRef.current) return;
    const cervicalMax = modes.find(mode => mode.label === activeLabel)?.max || 0;
    if (cervicalMax == 0) return;
    mqttRef.current.publish(cervicalMax, activeLabel);
    console.log("Start: MQTT published →", cervicalMax, "mode →", activeLabel);
  }

  const pair = () => {
    if (!isClient || !activeLabel || !mqttRef.current) return;
    mqttRef.current.pair();
    console.log("MQTT Devices → Start Query");
  }

  const handleEditSubmit = async () => {
    if (!isClient || !activeLabel || !mqttRef.current || !selectedDevice) return;
    const response = await saveDevice(selectedDevice);
    if (response?.status == "ok") {
      toast.success("Device Saved Successfully");
    } else {
      toast.error("Cannot Save Device");
    }
    setShowEditDialog(false);
    console.log(`Selected Device: ${selectedDevice}`);
  };

  const initialTime: TimeData[] = [
    { label: "remaining", current: timer, fill: "hsl(142, 71%, 45%)" },
    { label: "elapsed", current: 0, fill: "#e5e7eb" }
  ];

  const [timeLeft, setTimeLeft] = React.useState<TimeData[]>(initialTime);
  const [percent, setPercent] = React.useState<TimeData[]>(initialTime);
  const [isEditing, setIsEditing] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState(timeLeft[0]?.current || 0);
  const [beginTime, setBeginTime] = React.useState<number | null>(null);
  const [endTime, setEndTime] = React.useState<number | null>(null);

  const handleTime = (newTime: number) => {
    setIsEditing(false);
    const updated = [
      { ...initialTime[0], current: newTime },
      { ...initialTime[1] }
    ];
    setTimeLeft(updated);
  }

  const initPercent = () => {
    const newTime = [
      { ...initialTime[0], current: timeValue },
      { ...initialTime[1] }
    ];
    setPercent(newTime);
  }

  React.useEffect(() => {
    if (!flag) return;

    initPercent();
    const now = Date.now();
    const duration = timeValue * 1000;
    const targetEndTime = now + duration;
    setBeginTime(now);

    const interval = setInterval(() => {
      const current = Date.now();
      const remaining = Math.max(targetEndTime - current, 0);
      const seconds = remaining / 1000;
      const percent = (remaining / duration) * timeValue;
      console.log(percent);

      setTimeLeft([
        { ...initialTime[0], current: seconds },
        { ...initialTime[1], current: timeValue - seconds }
      ]);

      setPercent([
        { ...initialTime[0], current: percent },
        { ...initialTime[1], current: timer - percent }
      ]);

      if (seconds <= 0) {
        clearInterval(interval);
        setFlag(false);
        setPressure({ pressure: 25 });
        setIsFinish(true);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [flag, timeValue]);

  React.useEffect(() => {
    if (!flag && isFinish) {
      const current = Date.now();
      setEndTime(current);
    }
  }, [flag]);

  if (!isClient) return null; // Prevents hydration issues

  return (
    <div>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="font-bold my-0 py-0">
              <span onClick={() => {
                if (!flag) {
                  setShowEditDialog(true);
                  pair();
                } else {
                  warning("Stop the system before pairing");
                }}} 
                className="inline-block transition-transform duration-200 hover:scale-110 origin-center hover:text-blue-500 cursor-pointer">
                Device: {activeDevice}
              </span>
            </div>
            <div className="font-bold my-0 py-0">
              <Link href={`/modes/${activeLabel}`}>
                <span className="inline-block transition-transform duration-200 hover:scale-110 origin-center hover:text-blue-500 cursor-pointer">
                  Patient ID: {patientId}
                </span>
              </Link>
            </div>
          </div>
          <div className="flex-1 text-center">
            <CardTitle className="text-2xl font-bold">{activeLabel}</CardTitle>
            <CardDescription>Pressure Data in mmHg</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <Button className="h-7 w-full sm:w-[120px]" disabled={fetchingDevice} onClick={() => {
                if (!flag) {
                  console.log(activeDevice);
                  if (!activeDevice) {
                    setShowEditDialog(true);
                    pair();
                  } else {
                    setData([]);
                    setFlag(true);
                    const curTime = new Date().toLocaleString();
                    setTime(curTime);
                    publish();
                    console.log(pressureData, pressureData.length);
                  }
                }
              }}>Start</Button>
              <Button className="h-7 w-full sm:w-[120px]" onClick={() => {
                setFlag(false);
                setPressure({ pressure: 25 });
                setIsFinish(true);
              }}>Stop</Button>
              <Button variant="outline" className="h-7 w-full sm:w-[120px]" onClick={() => {
                if (!flag) {
                  setShowEditDialog(true);
                  pair();
                } else {
                  warning("Stop the system before pairing");
                }
              }}>Pair</Button>

              {activeLabel === "Custom" && (
                <Button variant="outline" className="h-7 w-full sm:w-[120px]" onClick={() => {
                  if (!flag) {
                    setIsCustom(true);
                  } else {
                    warning("Stop the system before pairing");
                  }
                }}>Custom</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="columns-2">
            <PieChart width={250} height={250}>
              <Pie
                data={percent}
                dataKey="current"
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500} // adjust for smoothness
                animationEasing="ease-out"
              >
                {percent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <PieLabel
                  position="center"
                  content={({ viewBox }) =>
                    (viewBox && "cx" in viewBox && "cy" in viewBox && viewBox?.cx && viewBox?.cy) ?
                      (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-black text-3xl font-bold dark:fill-white cursor-pointer transition duration-200 hover:scale-110 origin-center hover:fill-blue-500 dark:hover:fill-blue-400"
                          onClick={() => setIsEditing(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setIsCustom(true);
                            }
                          }}
                        >
                          {timeLeft[0]?.current.toFixed(1)}
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy + 20}
                            className="text-lg fill-gray-500 hover:fill-blue-500 dark:fill-gray-400 dark:hover:fill-blue-400"
                          >
                            seconds
                          </tspan>
                        </text>
                      ) : null
                  }
                />
              </Pie>
            </PieChart>
            <PieChart width={250} height={250}>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500} // adjust for smoothness
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <PieLabel
                  position="center"
                  content={({ viewBox }) =>
                    (viewBox && "cx" in viewBox && "cy" in viewBox && viewBox?.cx && viewBox?.cy) ? (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={activeLabel === "Custom" ? "fill-black text-3xl font-bold dark:fill-white cursor-pointer transition duration-200 hover:scale-110 origin-center hover:fill-blue-500 dark:hover:fill-blue-400" : "fill-black text-3xl font-bold dark:fill-white"}
                        {...(activeLabel === "Custom" && {
                          onClick: () => setIsCustom(true),
                          onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") setIsCustom(true);
                          },
                          tabIndex: 0,
                        })}
                      >
                        {safePressure.toFixed(1)}
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 20}
                          className={activeLabel === "Custom" ? "text-lg fill-gray-500 hover:fill-blue-500 dark:fill-gray-400 dark:hover:fill-blue-400" : "fill-gray-500 text-lg dark:fill-gray-400"}
                        >
                          mmHg
                        </tspan>
                      </text>
                    ) : null
                  }
                />
              </Pie>
              <Pie
                data={[{ value: 10, fill: "rgba(255,0,0,0.5)" }]}
                dataKey="value"
                innerRadius={92}
                outerRadius={106}
                startAngle={minAngle}
                endAngle={maxAngle}
                stroke="none"
              >
                <Cell fill="rgba(255, 0, 0, 0.8)" className="dark:bg-red-600" />
              </Pie>
            </PieChart>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {/* Left: Status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${flag ? 'bg-green-400' : 'bg-red-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${flag ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            <span className={flag ? "text-green-700" : "text-red-700"}>
              {flag ? "Started" : "Stopped"}
            </span>
          </div>

          {/* Right: Another element */}
          <div className="text-sm text-gray-500">
            {flag ? (pressureData.length > 0 ? `${pressure.pressure} mmHg` : "No Data") : new Date().toLocaleString()}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pair Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="block mb-2">Available Devices</Label>
              <div className="space-y-2">
                {devices.length > 0 ? (
                  devices.map((device) => (
                    <label
                      key={device}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded ${selectedDevice === device ? "bg-blue-100" : "hover:bg-gray-100"
                        }`}
                    >
                      <input
                        type="radio"
                        name="device"
                        value={device}
                        checked={selectedDevice === device}
                        onChange={() => setSelectedDevice(device)}
                      />
                      <span>{device}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No devices detected yet.</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Summarize pressure={pressureData} startAt={beginTime} finishAt={endTime} isFinish={isFinish} setIsFinish={setIsFinish} />

      <Custom modes={modes} isCustom={isCustom} setModes={setModes} setIsCustom={setIsCustom} />

      <Timer timer={timer} onSubmit={handleTime} isEditing={isEditing} setTimeValue={setTimeValue} setInitTimer={setInitTimer} setIsEditing={setIsEditing} />

    </div>
  );
}

function Summarize({ pressure, startAt, finishAt, isFinish, setIsFinish }: {
  pressure: { pressure: number; timestamp: string }[],
  startAt: number | null,
  finishAt: number | null,
  isFinish: boolean,
  setIsFinish: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const averagePressure = pressure.length > 0 ? pressure.reduce((sum, p) => sum + p.pressure, 0) / pressure.length : 0;
  const pressureOnly = pressure.filter(p => p.pressure != 0).map(p => p.pressure);
  const minPressure = pressureOnly.length ? Math.min(...pressureOnly) : null;
  const maxPressure = pressureOnly.length ? Math.max(...pressureOnly) : null;
  let elapsedTime = 0;
  if (startAt && finishAt) {
    const startTime = new Date(startAt).getTime();
    const endTime = new Date(finishAt).getTime(); // assuming finalTime is a Date or string
    elapsedTime = (endTime - startTime) / 1000;
  }
  return (
    <Dialog open={isFinish} onOpenChange={setIsFinish}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Progression Finish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="block mb-2">Operation Start at {startAt ? new Date(startAt).toLocaleString() : "N/A"}</Label>
            <Label className="block mb-2">Operation Finished at {finishAt ? new Date(finishAt).toLocaleString() : "N/A"}</Label>
            <Label className="block mb-2">Elapsed Time: {elapsedTime} second(s)</Label>
            {pressureOnly.length > 0 && (
              <>
                <Label className="block mb-2">Average Pressure: {averagePressure} mmHg</Label>
                <Label className="block mb-2">Maximum Pressure: {maxPressure} mmHg</Label>
                <Label className="block mb-2">Minimum Pressure: {minPressure} mmHg</Label>
              </>
            )
            }
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setIsFinish(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => setIsFinish(false)}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Custom({ modes, isCustom, setModes, setIsCustom }: {
  modes: Modes[],
  isCustom: boolean,
  setModes: React.Dispatch<React.SetStateAction<Modes[]>>
  setIsCustom: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const custom = modes.find(mode => mode.label === "Custom");
  const maxPressure = React.useRef<HTMLInputElement>(null);
  const minPressure = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog open={isCustom} onOpenChange={setIsCustom}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Pressure Value</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex">
            <div className="flex mx-auto">Maximum Target Pressure :</div>
            <div className="flex mx-auto">
              <Input placeholder="mmHg" ref={maxPressure} type="number" min={0} max={100} defaultValue={custom?.max} />
            </div>
          </div>
          <div className="flex">
            <div className="flex mx-auto">Minimum Target Pressure :</div>
            <div className="flex mx-auto">
              <Input placeholder="mmHg" ref={minPressure} type="number" min={0} max={100} defaultValue={custom?.min} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setIsCustom(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => {
            setIsCustom(false);
            const min = minPressure.current?.valueAsNumber;
            const max = maxPressure.current?.valueAsNumber;
            if (!min || !max) toast.error("Please Fill the Pressure Values");
            else {
              const updated = modes.map(mode => mode.label === "Custom" ? { ...mode, min: min, max: max } : mode)
              setModes(updated);
              toast.success("Updated Pressure Values");
            }
          }
          }>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Timer({ timer, onSubmit, isEditing, setTimeValue, setInitTimer, setIsEditing }: {
  timer: number
  onSubmit?: (newTime: number) => void,
  isEditing: boolean,
  setTimeValue: React.Dispatch<React.SetStateAction<number>>,
  setInitTimer: React.Dispatch<React.SetStateAction<number>>,
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
}) {
  const time = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Countdown Timer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex">
            <div className="flex mx-auto">Set Timer :</div>
            <div className="flex mx-auto">
              <Input placeholder="mmHg" ref={time} type="number" min={0} max={100} defaultValue={timer} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => {
            setIsEditing(false);
            const newTime = time.current?.valueAsNumber;
            if (!newTime) toast.error("Please Fill the Time Duration");
            else {
              setInitTimer(newTime);
              setTimeValue(newTime);
              if (onSubmit) onSubmit(newTime);
              toast.success("Updated Timer Duration");
            }
          }
          }>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Chart;
