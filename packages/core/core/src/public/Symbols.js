// @flow
import type {
  Symbol as ISymbol,
  MutableAssetSymbols as IMutableAssetSymbols,
  AssetSymbols as IAssetSymbols,
  MutableDependencySymbols as IMutableDependencySymbols,
  SourceLocation,
} from '@parcel/types';
import type {Asset, Dependency} from '../types';

const EMPTY_ITERABLE = {
  [Symbol.iterator]() {
    return EMPTY_ITERATOR;
  },
};

const EMPTY_ITERATOR = {
  next() {
    return {done: true};
  },
};

const inspect = Symbol.for('nodejs.util.inspect.custom');

let valueToSymbols: WeakMap<Asset, AssetSymbols> = new WeakMap();

export class AssetSymbols implements IAssetSymbols {
  /*::
  @@iterator(): Iterator<[ISymbol, {|local: ISymbol, loc: ?SourceLocation|}]> { return ({}: any); }
  */
  #value /*: Asset */;

  constructor(asset: Asset): AssetSymbols {
    let existing = valueToSymbols.get(asset);
    if (existing != null) {
      return existing;
    }

    this.#value = asset;
    valueToSymbols.set(asset, this);
    return this;
  }

  get(exportSymbol: ISymbol): ?{|local: ISymbol, loc: ?SourceLocation|} {
    return this.#value.symbols.get(exportSymbol);
  }

  hasExportSymbol(exportSymbol: ISymbol): boolean {
    return Boolean(this.#value.symbols.has(exportSymbol));
  }

  hasLocalSymbol(local: ISymbol): boolean {
    for (let s of this.#value.symbols.values()) {
      if (local === s.local) return true;
    }
    return false;
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return this.#value.symbols[Symbol.iterator]();
  }

  exportSymbols(): Iterable<ISymbol> {
    // $FlowFixMe
    return this.#value.symbols.keys();
  }

  // $FlowFixMe
  [inspect]() {
    return `AssetSymbols(${[...this.#value.symbols]
      .map(([s, {local}]) => `${s}:${local}`)
      .join(', ')})`;
  }
}

let valueToMutableAssetSymbols: WeakMap<
  Asset,
  MutableAssetSymbols,
> = new WeakMap();
export class MutableAssetSymbols implements IMutableAssetSymbols {
  /*::
  @@iterator(): Iterator<[ISymbol, {|local: ISymbol, loc: ?SourceLocation|}]> { return ({}: any); }
  */
  #value: Asset;

  constructor(asset: Asset): MutableAssetSymbols {
    let existing = valueToMutableAssetSymbols.get(asset);
    if (existing != null) {
      return existing;
    }
    this.#value = asset;
    return this;
  }

  clear() {
    this.#value.symbols.clear();
  }

  set(exportSymbol: ISymbol, local: ISymbol, loc: ?SourceLocation) {
    this.#value.symbols.set(exportSymbol, {local, loc});
  }

  get(exportSymbol: ISymbol): ?{|local: ISymbol, loc: ?SourceLocation|} {
    return this.#value.symbols.get(exportSymbol);
  }

  hasExportSymbol(exportSymbol: ISymbol): boolean {
    return Boolean(this.#value.symbols.has(exportSymbol));
  }

  hasLocalSymbol(local: ISymbol): boolean {
    for (let s of this.#value.symbols.values()) {
      if (local === s.local) return true;
    }
    return false;
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return this.#value.symbols[Symbol.iterator]();
  }

  exportSymbols(): Iterable<ISymbol> {
    return this.#value.symbols.keys();
  }

  // $FlowFixMe
  [inspect]() {
    return `MutableAssetSymbols(${
      this.#value.symbols
        ? [...this.#value.symbols]
            .map(([s, {local}]) => `${s}:${local}`)
            .join(', ')
        : null
    })`;
  }
}

let valueToMutableDependencySymbols: WeakMap<
  Dependency,
  MutableDependencySymbols,
> = new WeakMap();
export class MutableDependencySymbols implements IMutableDependencySymbols {
  /*::
  @@iterator(): Iterator<[ISymbol, {|local: ISymbol, loc: ?SourceLocation, isWeak: boolean|}]> { return ({}: any); }
  */
  #value: Dependency;

  constructor(dep: Dependency): MutableDependencySymbols {
    let existing = valueToMutableDependencySymbols.get(dep);
    if (existing != null) {
      return existing;
    }
    this.#value = dep;
    return this;
  }

  ensure(): void {
    let symbols = this.#value.symbols;
    if (this.#value.symbols == null) {
      symbols = new Map();
      this.#value.symbols = symbols;
    }
  }

  set(
    exportSymbol: ISymbol,
    local: ISymbol,
    loc: ?SourceLocation,
    isWeak: ?boolean,
  ) {
    let symbols = this.#value.symbols;
    if (symbols == null) {
      symbols = new Map();
      this.#value.symbols = symbols;
    }
    symbols.set(exportSymbol, {
      local,
      loc,
      isWeak: (symbols.get(exportSymbol)?.isWeak ?? true) && (isWeak ?? false),
    });
  }

  get(
    exportSymbol: ISymbol,
  ): ?{|local: ISymbol, loc: ?SourceLocation, isWeak: boolean|} {
    return this.#value.symbols?.get(exportSymbol);
  }

  hasExportSymbol(exportSymbol: ISymbol): boolean {
    return Boolean(this.#value.symbols?.has(exportSymbol));
  }

  hasLocalSymbol(local: ISymbol): boolean {
    if (this.#value.symbols) {
      for (let s of this.#value.symbols.values()) {
        if (local === s.local) return true;
      }
    }
    return false;
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return this.#value.symbols
      ? this.#value.symbols[Symbol.iterator]()
      : EMPTY_ITERATOR;
  }

  exportSymbols(): Iterable<ISymbol> {
    // $FlowFixMe
    return this.#value.symbols ? this.#value.symbols.keys() : EMPTY_ITERABLE;
  }

  get isCleared(): boolean {
    return this.#value.symbols == null;
  }

  // $FlowFixMe
  [inspect]() {
    return `MutableDependencySymbols(${
      this.#value.symbols
        ? [...this.#value.symbols]
            .map(([s, {local, isWeak}]) => `${s}:${local}${isWeak ? '?' : ''}`)
            .join(', ')
        : null
    })`;
  }
}
