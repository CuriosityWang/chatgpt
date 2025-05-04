import { MdOutlineTipsAndUpdates } from "react-icons/md";
import examples from "@/data/examples.json";
import { useMemo, useState } from "react"
import Button from "@/components/common/Button";
import { useEventBusContext } from "@/components/EventBusContext";

export default function Example() {
  const [showfull, setShowFull] = useState(false);
  // // 写法 1
  // const list = useMemo(() => {
  //   return showfull ? examples : examples.slice(0, 15);
  // }, [showfull]);

  // // 写法 2
  const list = examples.slice(0, showfull ? examples.length : 15);
  const { publish } = useEventBusContext();

  return (
    <>
      <div className="mt-20 mb-4 text-4xl">
        <MdOutlineTipsAndUpdates />
      </div>
      <ul className="flex justify-center items-center flex-wrap gap-3.5">
        {list.map((item) => {
          return (
            <li key={item.act}>
              <Button
                onClick={() => {
                  publish("createNewChat", item.prompt);
                }}
              >
                {item.act}
              </Button>
            </li>
          );
        })}
      </ul>
      {!showfull && (
        <>
          <p className="p-2">...</p>
          <div className="flex items-center w-full space-x-2">
            <hr className="flex-1 border-t border-dotted border-gray-200 dark:border-gray-600" />
            <Button
              variant="text"
              onClick={() => {
                setShowFull(true);
              }}
            >
              显示全部
            </Button>
            <hr className="flex-1 border-t border-dotted border-gray-200 dark:border-gray-600" />
          </div>
        </>
      )}

      {showfull && (
        <>
          <p className="p-4 text-gray-400 ">我是有底线的...</p>
          <div className="flex items-center w-full space-x-2">
            <hr className="flex-1 border-t border-dotted border-gray-200 dark:border-gray-600" />
            <Button
              variant="text"
              onClick={() => {
                setShowFull(false);
              }}
            >
              收起
            </Button>
            <hr className="flex-1 border-t border-dotted border-gray-200 dark:border-gray-600" />
          </div>
        </>
      )}
    </>
  );
}
