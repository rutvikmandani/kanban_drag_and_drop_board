import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import _uniqBy from "lodash/uniqBy";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { setData } from "../Store/Action";

export const App = () => {
  const fullData = useSelector((state) => state.data?.data)
  const dispatch = useDispatch()
  const [items, setItems] = useState();
  const [isReset, setIsReset] = useState(false);
  const [focusId, setFocusIdd] = useState();
  const inputRef = useRef();
  const dummyRef = useRef();

  const COLUMN_NAMES = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    COMPLETED: "Completed",
    DEPLOYED: "Deployed",
  };

  const { NOT_STARTED } = COLUMN_NAMES;
  const tasks = [
    { id: 1, name: "", column: NOT_STARTED },
    { id: 2, name: "", column: NOT_STARTED },
    { id: 3, name: "", column: NOT_STARTED },
    { id: 4, name: "", column: NOT_STARTED },
  ];

  if (fullData.length === 0 && !items) {
    setItems(tasks);
  } else if (fullData.length !== 0 && !items) {
    setItems(fullData);
  }

  useEffect(() => {
    dispatch(setData(items))
    if(isReset){
      dispatch(setData(tasks))
      setItems(tasks)
      setIsReset(false)
    }
  }, [items,isReset]);

  useEffect(() => {
    inputRef?.current?.focus();
  });

  const MovableItem = ({
    name,
    id,
    index,
    currentColumnName,
    moveCardHandler,
    setItems,
  }) => {
    const changeItemColumn = (currentItem, columnName) => {
      setItems((prevState) => {
        return prevState.map((e) => {
          return {
            ...e,
            column: e.id === currentItem.id ? columnName : e.column,
          };
        });
      });
    };

    const setFocusId = (id) => {
      setFocusIdd(id);
    };

    const onChangeHandler = (e, id) => {
      const newItems = items.map((el) => {
        if (el.id === id) {
          return { ...el, name: e.target.value };
        } else {
          return el;
        }
      });
      setItems(newItems);
    };

    const ref = useRef(null);
    const [, drop] = useDrop({
      accept: "Our first type",
      hover(item, monitor) {
        const dragIndex = item.index;
        const hoverIndex = index;
        const dragColumn = item.currentColumnName;
        if (dragIndex === hoverIndex) {
          return;
        }
        moveCardHandler(
          monitor.getItem().index,
          dragIndex,
          hoverIndex,
          dragColumn
        );
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: "Our first type",
      item: { index, name, currentColumnName, id },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          const { name, id } = dropResult;
          changeItemColumn(item, id);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const opacity = isDragging ? 0.4 : 1;

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className="movable-item"
        style={{ opacity }}
        onClick={() => setFocusId(id)}
      >
        <input
          ref={focusId === id ? inputRef : dummyRef}
          className="movable-item input"
          value={name}
          onChange={(e) => onChangeHandler(e, id)}
        />
      </div>
    );
  };

  const Column = ({ children, className, title }) => {
    const [{ isOver }, drop] = useDrop({
      accept: "Our first type",
      drop: () => ({ id: title }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });
    return (
      <div ref={drop} className={className}>
        <p>{title}</p>
        <hr />
        <span>{children}</span>
      </div>
    );
  };

  const moveCardHandler = (index, dragIndex, hoverIndex, dragColumn) => {
    const newItems = [];
    items.map((el) => {
      if (el.column === dragColumn) {
        newItems.push(el);
      }
    });

    const dragItem = newItems[dragIndex];
    if (dragItem) {
      setItems((prevState) => {
        const duplicateItems = [...prevState];
        const prevItem = newItems.splice(hoverIndex, 1, dragItem);
        newItems.splice(dragIndex, 1, prevItem[0]);
        const filterDuplicateItems = duplicateItems.filter((el) => {
          const findAt = newItems.findIndex((item) => item.id === el.id);
          if (findAt !== -1) {
            return false;
          }
          return true;
        });
        return _uniqBy([...newItems, ...filterDuplicateItems], "id");
      });
    }
  };
  const insertInput = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        name: "",
        column: NOT_STARTED,
      },
    ]);
  };

  const returnItemsForColumn = (columnName) => {
    if (items) {
      return items
        .filter((item) => item.column === columnName)
        .map((item, index) => (
          <MovableItem
            key={item.id}
            name={item.name}
            id={item.id}
            currentColumnName={item.column}
            setItems={setItems}
            index={index}
            moveCardHandler={moveCardHandler}
          />
        ));
    }
  };

  return (
    <>
      <div className="page">
        <div className="row">
          <button onClick={insertInput}> + </button>
          <button className="reset" onClick={() => setIsReset(true)}>
            Reset
          </button>
        </div>
        <div className="container">
          <DndProvider backend={HTML5Backend}>
            {Object.entries(COLUMN_NAMES).map((el) => {
              return (
                <Column key={el} title={el[1]} className="column">
                  {returnItemsForColumn(el[1])}
                </Column>
              );
            })}
          </DndProvider>
        </div>
      </div>
    </>
  );
};