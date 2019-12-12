import './FontAwesomeIcons.css';

import React, { FC, useEffect, useRef, useState } from 'react';

import { navigate } from '@reach/router';

import { kenticoKontent } from '../../appSettings.json';
import { loadModule } from '../../utilities/modules';
import { RoutedFC } from '../../utilities/routing';
import { Element, ICustomElement } from './customElement';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IDetailsValue {}

interface IDetailsConfig {}

interface IFontAwesomeIconsProps {}

const defaultDetailsValue: IDetailsValue = { customer: '', requester: '' };

export const FontAwesomeIcons: RoutedFC<IFontAwesomeIconsProps> = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const customElementRef = useRef<HTMLDivElement>(null);
  const customElementConfig = useRef<IDetailsConfig>({});

  useEffect(() => {
    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

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
      CustomElement.setHeight(customElementRef.current.scrollHeight);
    }
  });

  useEffect(() => {
    if (available) {
      CustomElement.setValue(JSON.stringify({}));
    }
  }, [available]);

  return (
    <div className={`custom element ${enabled ? '' : 'disabled'}`} ref={customElementRef}>
      {available && (
        <>
          <div className='text element'>
            <div className='pane'>
              <label className='label'>header</label>
              <div className='guidelines'>
                <p>guidelines</p>
              </div>
            </div>
          </div>
          {!enabled && (
            <>
              {ready && (
                <div className='element'>
                  <div className='pane'>
                    <label className='label'>header</label>
                    explanation
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
