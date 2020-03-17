import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Employee } from './employee';
import { EmployeeService } from './employee.service';
import { environment } from './environment';

const apiUrl = environment.apiUrl;

describe('Employee Service', () => {
  let httpTestingController: HttpTestingController;
  let service: EmployeeService;
  let testData: Array<Partial<Employee>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(EmployeeService);

    // Initialize data in the beforeEach to ensure each test case gets
    // an unmodified copy of the test data.
    testData = [
      {
        first_name: 'Sara'
      },
      {
        first_name: 'Joe'
      },
      {
        first_name: 'Bob'
      }
    ];
  });

  it('should return the data from the backend', () => {
    let employees: string[] = [];

    // The act of subscribing triggers the http call
    service.getList().subscribe(
      data =>
        // This line will execute after the call to req.flush(testData)
        (employees = data)
    );

    // expectOne will throw an error if this url has not been requested exactly one time
    const req = httpTestingController.expectOne(
      apiUrl + '/employees'
    );

    expect(req.request.method).toEqual('GET');

    // This line causes the Observable returned by http call to emit the testData
    req.flush(testData);

    // Test result as well as verify our test really runs synchronously
    expect(employees).toEqual(['Bob', 'Joe', 'Sara']);

    // Verify there are no outstanding http requests
    httpTestingController.verify();
  });

  it('should handle an http error', () => {
    let employees: string[] = [];

    service.getList().subscribe(data => (employees = data));

    const req = httpTestingController.expectOne(
      apiUrl + '/employees'
    );

    const mockError = new ErrorEvent('Network Error', {
      message: 'connection timeout'
    });
    req.error(mockError);

    expect(employees).toEqual(['no employees could be loaded']);
    httpTestingController.verify();
  });
});
