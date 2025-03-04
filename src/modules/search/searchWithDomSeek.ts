/*
 * Copyright 2018-2020 DITA (AM Consulting LLC)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Developed on behalf of: Bibliotheca LLC (https://www.bibliotheca.com)
 * Licensed to: Bibliotheca LLC, Bokbasen AS and CAST under one or more contributor license agreements.
 */

import { convertRange } from "../highlight/renderer/iframe/selection";
import { uniqueCssSelector } from "../highlight/renderer/common/cssselector2";
import { IRangeInfo } from "../highlight/common/selection";

export interface ISearchResult {
  rangeInfo: IRangeInfo;
  textMatch: string;
  textBefore: string;
  textAfter: string;
  href: string;
  title: string;
  uuid: string;
  highlight?: any;
}

const collapseWhitespaces = (str: string) => {
  return str.replace(/\n/g, " ").replace(/\s\s+/g, " ");
};
const cleanupStr = (str: string) => {
  return collapseWhitespaces(str).trim();
};

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
export function escapeRegExp(str: string) {
  return str && reHasRegExpChar.test(str)
    ? str.replace(reRegExpChar, "\\$&")
    : str || "";
}
var _counter = 0;
const counter = () => {
  // let _counter = 0;
  return () => {
    return Number.isSafeInteger(++_counter) ? _counter : (_counter = 1);
  };
};
export const reset = () => {
  _counter = 0;
};
const getCount = counter();

const _getCssSelectorOptions = {
  className: (_str: string) => {
    return true;
  },
  idName: (_str: string) => {
    return true;
  },
  tagName: (_str: string) => {
    return true;
  },
};

const getCssSelector_ =
  (doc: Document) =>
  (element: Element): string => {
    try {
      return uniqueCssSelector(element, doc, _getCssSelectorOptions);
    } catch (err) {
      console.error("uniqueCssSelector:", err);
      return "";
    }
  };

export async function searchDocDomSeek(
  searchInput: string,
  doc: Document,
  href: string,
  title: string
): Promise<ISearchResult[]> {
  const text = doc.body.textContent;
  if (!text) {
    return [];
  }

  searchInput = cleanupStr(searchInput);
  if (!searchInput.length) {
    return [];
  }

  const iter = doc.createNodeIterator(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (_node) => NodeFilter.FILTER_ACCEPT,
  });

  const regexp = new RegExp(
    escapeRegExp(searchInput).replace(/ /g, "\\s+"),
    "gim"
  );
  const searchResults: ISearchResult[] = [];
  const snippetLength = 100;
  const snippetLengthNormalized = 30;
  let accumulated = 0;
  let matches: RegExpExecArray;
  while ((matches = regexp.exec(text))) {
    let i = Math.max(0, matches.index - snippetLength);
    let l = Math.min(snippetLength, matches.index);
    let textBefore = collapseWhitespaces(text.substr(i, l));
    textBefore = textBefore.substr(textBefore.length - snippetLengthNormalized);

    i = regexp.lastIndex;
    l = Math.min(snippetLength, text.length - i);
    const textAfter = collapseWhitespaces(text.substr(i, l)).substr(
      0,
      snippetLengthNormalized
    );

    const range = new Range();

    let offset = matches.index;
    while (accumulated <= offset) {
      const nextNode = iter.nextNode();
      accumulated += nextNode.nodeValue.length;
    }
    let localOffset =
      iter.referenceNode.nodeValue.length - (accumulated - offset);
    range.setStart(iter.referenceNode, localOffset);

    offset = matches.index + matches[0].length;
    while (accumulated <= offset) {
      const nextNode = iter.nextNode();
      accumulated += nextNode.nodeValue.length;
    }
    localOffset = iter.referenceNode.nodeValue.length - (accumulated - offset);
    range.setEnd(iter.referenceNode, localOffset);

    if (!(doc as any).getCssSelector) {
      (doc as any).getCssSelector = getCssSelector_(doc);
    }
    const rangeInfo = convertRange(range, (doc as any).getCssSelector); // computeElementCFI

    searchResults.push({
      textMatch: collapseWhitespaces(matches[0]),
      textBefore,
      textAfter,
      rangeInfo,
      href,
      title,
      uuid: getCount().toString(),
    });
  }

  return searchResults;
}
