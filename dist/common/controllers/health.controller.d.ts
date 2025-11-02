export declare class HealthController {
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    };
    getReady(): {
        ready: boolean;
        timestamp: string;
    };
    getLive(): {
        alive: boolean;
        timestamp: string;
    };
}
