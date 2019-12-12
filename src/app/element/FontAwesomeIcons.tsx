import './fontAwesomeIcons.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import { navigate } from '@reach/router';

import { kenticoKontent } from '../../appSettings.json';
import * as icons from '../../icons.json';
import { loadModule } from '../../utilities/modules';
import { RoutedFC } from '../../utilities/routing';
import { Element, ICustomElement } from './customElement';
import { DraggableIcon } from './DraggableIcon';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IFontAwesomeIconsValue {
  value: IIcon[];
}

interface IFontAwesomeIconsConfig {}

interface IFontAwesomeIconsProps {}

const defaultFontAwesomeIconsValue: IFontAwesomeIconsValue = { value: [] };

type IconStyle = 'brands' | 'solid' | 'regular';

interface IListedIcon extends IIcon {
  selected: boolean;
  found: boolean;
}

export interface IIcon {
  icon: string;
  styles: IconStyle[];
  unicode: string;
  order: number;
}

const allIcons = Object.keys((icons as any).default).map<IListedIcon>(icon => ({
  icon,
  styles: (icons as any).default[icon].styles,
  unicode: (icons as any).default[icon].unicode,
  selected: false,
  found: false,
  order: 0
}));

export const FontAwesomeIcons: RoutedFC<IFontAwesomeIconsProps> = () => {
  if (window.self === window.top) {
    navigate('/error');
  }

  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [icons, setIcons] = useState<IListedIcon[]>(allIcons);

  const searchRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const customElementConfig = useRef<IFontAwesomeIconsConfig>({});

  useEffect(() => {
    if (!available) {
      const initCustomElement = (element: Element) => {
        const elementValue = JSON.parse(
          element.value || JSON.stringify(defaultFontAwesomeIconsValue)
        ) as IFontAwesomeIconsValue;

        for (const valueIcon of elementValue.value) {
          const icon = icons.filter(icon => icon.icon === valueIcon.icon)[0];

          if (icon) {
            icon.selected = true;
            icon.order = valueIcon.order;
          }
        }

        setIcons([...icons.sort((iconA, iconB) => iconA.order - iconB.order)]);
        setAvailable(true);
        setElementEnabled(!element.disabled);

        CustomElement.onDisabledChanged(disabled => setElementEnabled(!disabled));
      };

      const setElementEnabled = (enabled: boolean) => {
        setEnabled(enabled);
      };

      loadModule(kenticoKontent.customElementScriptEndpoint, () => CustomElement.init(initCustomElement));
    }
  }, [icons, available]);

  useEffect(() => {
    if (available && searchRef.current && listRef.current) {
      let totalHeight = searchRef.current.scrollHeight + listRef.current.scrollHeight;

      CustomElement.setHeight(Math.min(300, totalHeight));
    }
  });

  useEffect(() => {
    if (available) {
      const selectedIcons = icons
        .filter(icon => icon.selected)
        .sort((iconA, iconB) => iconA.order - iconB.order)
        .map<IIcon>(icon => ({
          icon: icon.icon,
          styles: icon.styles,
          unicode: icon.unicode,
          order: icon.order
        }));

      CustomElement.setValue(JSON.stringify({ value: selectedIcons }));
    }
  }, [available, icons]);

  const search = (searchValue: string) => {
    setSearchValue(searchValue);

    for (const icon of icons) {
      if (searchValue !== '' && icon.icon.indexOf(searchValue) > -1) {
        icon.found = true;
      } else {
        icon.found = false;
      }
    }

    setIcons([...icons]);
  };

  const selectIcon = (icon: IListedIcon) => {
    if (enabled) {
      const selectedIcon = icons.filter(foundIcon => foundIcon.icon === icon.icon)[0];

      selectedIcon.selected = !selectedIcon.selected;

      const selectedIcons = icons.filter(icon => icon.selected);
      selectedIcons.forEach((icon, index) => (icon.order = index));

      setIcons([...icons]);
    }
  };

  const getClass = (icon: IListedIcon) => {
    return `fa${icon.styles[0][0]} fa-${icon.icon}`;
  };

  const dragIcon = useCallback(
    (newIcon: IIcon, dragIcon: IIcon, dragIndex: number, hoverIndex: number) => {
      const selectedIcons = icons.filter(icon => icon.selected);

      for (const icon of selectedIcons) {
        if (icon.icon === dragIcon.icon) {
          icon.order = hoverIndex;
        } else if (icon.icon === newIcon.icon) {
          icon.order = dragIndex;
        }
      }

      setIcons([...icons]);
    },
    [icons]
  );

  return (
    <DndProvider backend={Backend}>
      <div className={`custom element ${enabled ? '' : 'disabled'}`}>
        {available && (
          <>
            {enabled && (
              <>
                <div className='text element'>
                  <div className='pane search' ref={searchRef}>
                    <label className='label'>Font Awesome Icons</label>
                    <div className='guidelines'>
                      <p>
                        Type a search term to show a list of <a href='https://fontawesome.com/'>Font Awesome</a> icons.
                        Select any icons.
                      </p>
                    </div>
                    <span className='input wrapper'>
                      <input
                        onChange={event => search(event.target.value)}
                        value={searchValue}
                        placeholder='Type a search term here...'
                      />
                      <span title='Clear' onClick={_ => setSearchValue('')}>
                        {searchValue === '' ? '' : '×'}
                      </span>
                    </span>
                  </div>
                  <div className='pane list' ref={listRef}>
                    {searchValue === '' &&
                      icons
                        .filter(icon => icon.selected)
                        .sort((iconA, iconB) => iconA.order - iconB.order)
                        .map((icon, index) => (
                          <DraggableIcon
                            key={index}
                            index={index}
                            icon={icon}
                            dragIcon={dragIcon}
                            onClick={_ => selectIcon(icon)}
                          />
                        ))}
                    {icons
                      .filter(icon => icon.found)
                      .map((icon, index) => (
                        <i
                          key={index}
                          className={`icon ${icon.selected ? 'selected' : ''} ${getClass(icon)}`}
                          onClick={_ => selectIcon(icon)}
                        />
                      ))}
                    {searchValue !== '' && !icons.some(icon => icon.found) && <div>No icons found</div>}
                  </div>
                </div>
              </>
            )}
            {!enabled && (
              <>
                <div className='element'>
                  <div className='pane search'>
                    <label className='label'>Font Awesome Icons</label>
                    <div className='guidelines'>
                      {icons.some(icon => icon.selected) && (
                        <p>
                          These are the selected <a href='https://fontawesome.com/'>Font Awesome</a> icons.
                        </p>
                      )}
                      {!icons.some(icon => icon.selected) && (
                        <p>
                          There are no selected <a href='https://fontawesome.com/'>Font Awesome</a> icons.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='pane list'>
                    {icons
                      .filter(icon => icon.selected)
                      .map((icon, index) => (
                        <i key={index} className={`icon ${icon.selected ? 'selected' : ''} ${getClass(icon)}`} />
                      ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
};
