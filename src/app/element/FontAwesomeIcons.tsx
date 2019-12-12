import './FontAwesomeIcons.css';

import { navigate } from '@reach/router';
import React, { useEffect, useRef, useState } from 'react';

import { kenticoKontent } from '../../appSettings.json';
import { loadModule } from '../../utilities/modules';
import { RoutedFC } from '../../utilities/routing';
import Icons from '../data/icons.json';
import { Element, ICustomElement } from './customElement';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IFontAwesomeIconsProps {}

interface IFontAwesomeIconRaw {
   svg: IFontAwesomeSvgWrapperRaw;
   label: string;
   search: {
       terms: string[];
   }
}

interface IFontAwesomeIcon {
    svg: string;
    title: string;
    search: string;
}

interface IFontAwesomeSvgWrapperRaw {
    brands?: IFontAwesomeSvgRaw;
    solid?: IFontAwesomeSvgRaw;
    regular?: IFontAwesomeSvgRaw;
}

interface IFontAwesomeSvgRaw {
    raw: string;
}

const getDisplayedIcons: (search: string) => IFontAwesomeIcon[] = (search) => {
    const icons: IFontAwesomeIcon[] = [];

    for (const iconKey of Object.keys(Icons)) {
        const icon = (Icons as any)[iconKey] as IFontAwesomeIconRaw;

        let iconSvg: IFontAwesomeSvgRaw | undefined = undefined;

        if (icon.svg.brands) {
            iconSvg = icon.svg.brands;
        } else if (icon.svg.regular) {
            iconSvg = icon.svg.regular;
        } else if (icon.svg.solid) {
            iconSvg = icon.svg.solid;
        }

        if (iconSvg) {
            icons.push({
                title: icon.label,
                svg: iconSvg.raw,
                search: icon.search.terms.join(' ') + ' ' + icon.label
            });
        }

    }

    return icons.filter(m => m.search.toLowerCase().includes(search.toLowerCase() || '')).slice(0, kenticoKontent.iconsCount);
}

export const FontAwesomeIcons: RoutedFC<IFontAwesomeIconsProps> = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const [, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [selectedIconSvg, setSelectedIconSvg] = useState<string | undefined>(undefined);
  const [enabled, setEnabled] = useState(true);
  const [, setSearchValue] = useState<string>('');
  const [icons, setIcons] = useState<IFontAwesomeIcon[]>(getDisplayedIcons(''));

  const customElementRef = useRef<HTMLDivElement>(null);
  const searchElementRef = useRef<HTMLInputElement>(null);

  function handleSearch(search?: string): void {
    setIcons(getDisplayedIcons(search || ''));
    setSearchValue(search || '');
  }

  function selectIcon(icon: IFontAwesomeIcon): void {
    CustomElement.setValue(icon.svg);
    setSelectedIconSvg(icon.svg);
  }

  useEffect(() => {
    const initCustomElement = (element: Element) => {
      const elementValue = element.value;

      if (elementValue) {
        setSelectedIconSvg(elementValue);
      }

      setAvailable(true);

      setElementEnabled(!element.disabled);

      CustomElement.onDisabledChanged(disabled => setElementEnabled(!disabled));
    };

    const setElementEnabled = (enabled: boolean) => {
      setEnabled(enabled);
      setReady(false);

      if (!enabled) {
        CustomElement.init((_, context) => {
          //
        });
      }
    };

    loadModule(kenticoKontent.customElementScriptEndpoint, () => CustomElement.init(initCustomElement));
  }, []);

  useEffect(() => {
    if (available && customElementRef.current) {
      CustomElement.setHeight(customElementRef.current.scrollHeight + 30);
    }
  });

  return (
    <div className={`custom element ${enabled ? '' : 'disabled'}`} ref={customElementRef}>
        {selectedIconSvg ? (
            <div className="selected-icon-wrapper">
            <div className="selected-icon">Selected icon: </div>
            <div dangerouslySetInnerHTML={{ __html: selectedIconSvg }}></div>
            </div>) : <div>No icon is selected</div>}
      {available && (
        <div>
        {enabled && (<>
          <input ref={searchElementRef} className="search-input" placeholder="Search icon" type="text" onChange={(m) => handleSearch(searchElementRef.current ? searchElementRef.current.value : '')}></input>
            <div className="icons-wrapper">
            </div>
            {icons.map(icon => <div title={icon.title} className="svg-wrapper" onClick={(e) => selectIcon(icon)}
                dangerouslySetInnerHTML={{ __html: icon.svg }}>
            </div>)}
        </>)}
        </div>
      )}
    </div>
  );
};
