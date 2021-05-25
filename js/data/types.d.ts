import Store, {
    StoreOptions
} from './abstract_store';

import DataSource, {
    DataSourceOptions
} from './data_source';
/**
 * @docid
 * @prevFileNamespace DevExpress.data
 * @public
 */
export type BaseMixinDataSource = Store | DataSource | DataSourceOptions;
/**
 * @docid
 * @prevFileNamespace DevExpress.data
 * @public
 */
export type DataSourceMixinArray = Array<any> | Store | DataSourceOptions;
/**
 * @docid
 * @prevFileNamespace DevExpress.data
 * @public
 */
export type DataSourceMixinString = string | BaseMixinDataSource;
/**
 * @docid
 * @prevFileNamespace DevExpress.data
 * @public
 */
export type ComplexCollectionDataSource<T> = Array<string | T | any> | DataSourceMixinString;
