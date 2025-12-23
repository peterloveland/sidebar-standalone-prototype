import { useState } from 'react';
import { useHeightAnimation } from '../hooks/useHeightAnimation';
import styles from './HeightAnimationDemo.module.css';

export function HeightAnimationDemo() {
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2']);
  const { lockHeight, animateToAuto, getContainerProps } = useHeightAnimation();

  const addItem = () => {
    lockHeight();
    setItems([...items, `Item ${items.length + 1}`]);
    // Animate after React has rendered the new item
    setTimeout(() => animateToAuto(), 100);
  };

  const removeItem = () => {
    if (items.length > 0) {
      lockHeight();
      setItems(items.slice(0, -1));
      setTimeout(() => animateToAuto(), 100);
    }
  };

  const containerProps = getContainerProps();

  return (
    <div className={styles.demo}>
      <h3>Height Animation Demo</h3>
      <p>Click the buttons to see the height animation in action:</p>
      
      <div className={styles.buttons}>
        <button onClick={addItem} className={styles.button}>
          Add Item
        </button>
        <button onClick={removeItem} className={styles.button} disabled={items.length === 0}>
          Remove Item
        </button>
      </div>

      <div 
        {...containerProps}
        className={`${styles.container} ${containerProps.className}`}
      >
        <div className={styles.content}>
          {items.map((item, index) => (
            <div key={index} className={styles.item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
