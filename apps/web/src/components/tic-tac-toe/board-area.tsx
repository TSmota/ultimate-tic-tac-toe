import type { PropsWithChildren } from "react";

export function BoardArea(props: PropsWithChildren) {
  return (
    <div className="border border-gray-300 flex items-center justify-center">
      {props.children}
    </div>
  )
}
