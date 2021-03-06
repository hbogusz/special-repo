import { LightningElement, wire, track } from 'lwc';

import getComplaints from '@salesforce/apex/InternalService.getComplaints';
import getComplaintId from '@salesforce/apex/InternalService.getComplaintId';
import { refreshApex } from '@salesforce/apex';


export default class Complaints extends LightningElement {
    wiredComplaintsResult;
    complaints;
    activeComplaint = '';
    @track
    activeComplaintResult;
    isLoading = true;


    @wire(getComplaints)
    wiredComplaints(result) {
        this.wiredComplaintsResult = result;
        if (result.data) {
            this.complaints = result.data;
            if (this.complaints.length == 0) {
                this.isLoading = false;
            }
        } else if (result.error) {
            console.log('data.error', result.error);
        }
    }
    @wire(getComplaintId)
    wiredComplaintId(result) {
        this.activeComplaintResult = result;
        if (result.data) {
            this.activeComplaint = result.data;

        } else if (result.error) {
            console.log('data.error', result.error);
        }
    }
    connectedCallback() {
        refreshApex(this.activeComplaintResult);
    }
    disableSpinner() {
        this.isLoading = false;
    }
}