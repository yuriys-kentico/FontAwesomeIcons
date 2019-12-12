import React, { FC, MouseEventHandler, useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';

import { IIcon } from './FontAwesomeIcons';

interface IDraggableIconProps {
  icon: IIcon;
  index: number;
  dragIcon: (icon: IIcon, dragIcon: IIcon, dragIndex: number, hoverIndex: number) => void;
  onClick: MouseEventHandler<HTMLElement>;
}

const iconType = 'icon';

interface DragItem {
  type: string;
  index: number;
  icon: IIcon;
}

export const DraggableIcon: FC<IDraggableIconProps> = ({ icon, index, dragIcon }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: iconType,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current!.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Time to actually perform the action
      dragIcon(icon, item.icon, dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: iconType, icon, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(drop(ref));

  const getClass = (icon: IIcon) => {
    return `fa${icon.styles[0][0]} fa-${icon.icon}`;
  };

  return (
    <i
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
      className={`icon selected ${getClass(icon)}`}
    />
  );
};
