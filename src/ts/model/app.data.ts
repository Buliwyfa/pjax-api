/// <reference path="../define.ts"/>
/// <reference path="data.ts"/>
/// <reference path="util.ts"/>

/* MODEL */

module MODULE.MODEL {
  
  export class AppData implements AppDataInterface {

    constructor(public model_: ModelInterface, public app_: ModelAppInterface) {
    }

    DATA_: ModelDataInterface = new MODEL.Data()
    storeNames = {
      meta: this.DATA_.DB.store.meta.name,
      history: this.DATA_.DB.store.history.name,
      log: this.DATA_.DB.store.log.name,
      server: this.DATA_.DB.store.server.name
    }

    getCookie(key: string): string {
      return this.DATA_.Cookie.getCookie(key);
    }

    setCookie(key: string, value: string, option?): string {
      return this.DATA_.Cookie.setCookie(key, value, option);
    }

    opendb(setting: SettingInterface): void {
      setting.database = false;
      this.DATA_.DB.opendb(() => {
        this.saveTitleToDB(setting.origLocation.href, document.title);
        this.saveScrollPositionToCacheAndDB(setting.origLocation.href, jQuery(window).scrollLeft(), jQuery(window).scrollTop());
        setting.database = true;
      });
    }

    getBuffer<U>(storeName: string): U
    getBuffer<T>(storeName: string, key: string): T
    getBuffer<T>(storeName: string, key: number): T
    getBuffer<T>(storeName: string, key?: any): any {
      return this.DATA_.DB.store[storeName].getBuffer(key);
    }

    setBuffer<T>(storeName: string, key: string, value: T, isMerge?: boolean): T {
      return this.DATA_.DB.store[storeName].setBuffer(key, value, isMerge);
    }

    loadBuffer(storeName: string, limit: number = 0): void {
      return this.DATA_.DB.store[storeName].loadBuffer(limit);
    }

    saveBuffer(storeName: string): void {
      return this.DATA_.DB.store[storeName].saveBuffer();
    }

    loadBufferAll(limit: number = 0): void {
      for (var i in this.storeNames) {
        this.loadBuffer(i, limit);
      }
    }

    saveBufferAll(): void {
      for (var i in this.storeNames) {
        this.saveBuffer(i);
      }
    }

    loadTitleFromDB(unsafe_url: string): void {
      var keyUrl: string = this.model_.convertUrlToKeyUrl(UTIL.canonicalizeUrl(unsafe_url)),
          that = this;

      var data: HistorySchema = this.DATA_.DB.store.history.getBuffer(keyUrl);

      if (data && 'string' === typeof data.title) {
        document.title = data.title;
      } else {
        this.DATA_.DB.store.history.get(keyUrl, function () {
          keyUrl === that.model_.convertUrlToKeyUrl(UTIL.canonicalizeUrl(window.location.href)) &&
          this.result && this.result.title && (document.title = this.result.title);
        });
      }
    }

    saveTitleToDB(unsafe_url: string, title: string): void {
      var keyUrl = this.model_.convertUrlToKeyUrl(UTIL.canonicalizeUrl(unsafe_url));

      var value: HistorySchema = <HistorySchema>{ id: keyUrl, title: title, date: new Date().getTime() };
      this.DATA_.DB.store.history.setBuffer(value, true);
      this.DATA_.DB.store.history.set(value);
      this.DATA_.DB.store.history.clean();
    }

    loadScrollPositionFromCacheOrDB(unsafe_url: string): void {
      var keyUrl: string = this.model_.convertUrlToKeyUrl(UTIL.canonicalizeUrl(unsafe_url));

      var data: HistorySchema = this.DATA_.DB.store.history.getBuffer(keyUrl);
      function scroll(scrollX, scrollY) {
        if ('number' !== typeof scrollX || 'number' !== typeof scrollY) { return; }

        window.scrollTo(parseInt(Number(scrollX) + '', 10), parseInt(Number(scrollY) + '', 10));
      }

      if (data && 'number' === typeof data.scrollX) {
        scroll(data.scrollX, data.scrollY);
      } else {
        this.DATA_.DB.store.history.get(keyUrl, function () {
          if (!this.result || keyUrl !== this.result.id) { return; }
          data = this.result;
          scroll(data.scrollX, data.scrollY);
        });
      }
    }

    saveScrollPositionToCacheAndDB(unsafe_url: string, scrollX: number, scrollY: number): void {
      var keyUrl = this.model_.convertUrlToKeyUrl(UTIL.canonicalizeUrl(unsafe_url));

      var value: HistorySchema = <HistorySchema>{ id: keyUrl, scrollX: scrollX, scrollY: scrollY, date: new Date().getTime() };
      this.DATA_.DB.store.history.setBuffer(value, true);
      this.DATA_.DB.store.history.set(value);
    }

    loadExpiresFromDB(keyUrl: string): void {
    }

    saveExpiresToDB(keyUrl: string, host: string, expires: number): void {
      var value: HistorySchema = <HistorySchema>{ id: keyUrl, host: host, expires: expires };
      this.DATA_.DB.store.history.setBuffer(value, true);
      this.DATA_.DB.store.history.set(value);
    }

    loadLogFromDB(): void {
    }

    saveLogToDB(log: LogSchema): void {
      this.DATA_.DB.store.log.addBuffer(log);
      this.DATA_.DB.store.log.add(log);
      this.DATA_.DB.store.log.clean();
    }

    loadServerFromDB(): void {
    }

    saveServerToDB(host: string, state: number = 0, unsafe_url?: string, expires: number = 0): void {
      var value: ServerSchema = <ServerSchema>{ id: host || '', state: state };
      this.DATA_.DB.store.server.setBuffer(value);
      this.DATA_.DB.store.server.set(value);
      if (unsafe_url) {
        this.saveExpiresToDB(unsafe_url, host, expires);
      }
    }

  }

}
