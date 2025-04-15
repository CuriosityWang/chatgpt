import { useAppcontext } from "@/components/AppContext";
import Button from "@/components/common/Button";
import { ActionType } from "@/reducers/AppReducer";
import { MdLightMode, MdDarkMode, MdAutoMode, MdInfo } from "react-icons/md";

export default function ToolBar() {
  const {
    state: { themeMode },
    dispatch,
  } = useAppcontext();
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 ">
      <Button
        icon={themeMode === "dark" ? MdDarkMode : MdLightMode}
        variant="text"
        className="text-gray-300 hover:text-gray-300"
        onClick={() => {
          dispatch({
            type: ActionType.UPDATE,
            field: "themeMode",
            value: themeMode === "dark" ? "light" : "dark",
          });
        }}
      ></Button>
    </div>
  );
}
