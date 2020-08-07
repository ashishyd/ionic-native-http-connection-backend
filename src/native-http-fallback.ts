import { HttpBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { checkAvailability } from '@ionic-native/core';
import { Observable } from 'rxjs';

import { NativeHttpBackend } from './native-http-backend';
import { checkExternalRequest } from './utils/check-external-request';

@Injectable()
export class NativeHttpFallback implements HttpBackend {
    constructor(
        private cordovaHttpBackend: NativeHttpBackend,
        private fallbackBackend: HttpBackend,
    ) {}

    handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        /**
         * Native HTTP Cordova plugin doesn't like local requests
         */
        const isExternalRequest = checkExternalRequest(req);

        if (
            isExternalRequest &&
            checkAvailability('cordova.plugin.http') === true
        ) {
            return this.cordovaHttpBackend.handle(req);
        } else {
            return this.fallbackBackend.handle(req);
        }
    }
}
