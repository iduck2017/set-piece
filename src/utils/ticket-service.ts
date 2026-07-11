class TicketService {
    protected _timestamp = Date.now();
    protected _ticket = 36 ** 7;

    /**
     * Return a time-prefixed ticket that is unique within the process.
     *
     * The ticket rolls over within the same millisecond by waiting for the
     * timestamp to advance before reusing the numeric range.
     *
     * @returns Base36 timestamp and ticket pair.
     */
    public query() {  
        this._ticket += 1;
        if (this._ticket >= 36 ** 8) {
            this._ticket = 36 ** 7;
            while (Date.now() === this._timestamp) {}
            this._timestamp = Date.now();
        };
        return `${this._timestamp.toString(36)}-${this._ticket.toString(36)}`;
    }
}

export const ticketService = new TicketService();
