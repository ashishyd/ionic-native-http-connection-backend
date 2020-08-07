import {
    HttpBackend,
    HttpEvent,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { checkAvailability } from '@ionic-native/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Observable, of } from 'rxjs';

import { NativeHttpBackend } from './native-http-backend';
import { NativeHttpFallback } from './native-http-fallback';

import Mock = jest.Mock;

jest.mock('@ionic-native/core');

class MockHttpBackend extends HttpBackend {
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        return of(new HttpResponse());
    }
}

describe('NativeHttpFallback', () => {
    let cordovaHttpBackend: NativeHttpBackend;
    let fallbackBackend: HttpBackend;
    let cordovaHttpFallback: NativeHttpFallback;

    beforeEach(() => {
        cordovaHttpBackend = new NativeHttpBackend(new HTTP());
        fallbackBackend = new MockHttpBackend();
        cordovaHttpFallback = new NativeHttpFallback(
            cordovaHttpBackend,
            fallbackBackend,
        );
    });

    it('should handle request with cordova backend in case of external request and plugin availability', (done) => {
        (checkAvailability as Mock<boolean>).mockImplementation(() => true);
        spyOn(cordovaHttpBackend, 'handle').and.returnValue(
            of(new HttpResponse()),
        );
        const request = new HttpRequest('GET', 'http://some-url');
        cordovaHttpFallback.handle(request).subscribe(() => {
            expect(cordovaHttpBackend.handle).toHaveBeenCalledWith(request);
            done();
        });
    });

    it('should handle request with fallback backend in case of internal request and plugin availability', (done) => {
        (checkAvailability as Mock<boolean>).mockImplementation(() => true);
        spyOn(fallbackBackend, 'handle').and.callThrough();
        const request = new HttpRequest('GET', '/some-url');
        cordovaHttpFallback.handle(request).subscribe(() => {
            expect(fallbackBackend.handle).toHaveBeenCalledWith(request);
            done();
        });
    });

    it('should handle request with fallback backend in case of plugin unavailability', (done) => {
        (checkAvailability as Mock<boolean>).mockImplementation(() => false);
        spyOn(fallbackBackend, 'handle').and.callThrough();
        const request = new HttpRequest('GET', 'http://some-url');
        cordovaHttpFallback.handle(request).subscribe(() => {
            expect(fallbackBackend.handle).toHaveBeenCalledWith(request);
            done();
        });
    });
});
