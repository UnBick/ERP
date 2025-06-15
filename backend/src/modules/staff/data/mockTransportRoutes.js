const mockRoutes = [
    {
        name: "Route 1",
        description: "Morning School Route - North",
        stops: [
            {
                name: "Stop 1",
                latitude: 19.0760,
                longitude: 72.8777,
                arrivalTime: "07:30",
                departureTime: "07:35",
                sequence: 1
            },
            {
                name: "Stop 2",
                latitude: 19.0821,
                longitude: 72.8823,
                arrivalTime: "07:45",
                departureTime: "07:50",
                sequence: 2
            }
        ],
        schedule: {
            startTime: "07:30",
            endTime: "08:30",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
    },
    {
        name: "Route 2",
        description: "Morning School Route - South",
        stops: [
            {
                name: "Stop 1",
                latitude: 19.0650,
                longitude: 72.8350,
                arrivalTime: "07:30",
                departureTime: "07:35",
                sequence: 1
            },
            {
                name: "Stop 2",
                latitude: 19.0730,
                longitude: 72.8420,
                arrivalTime: "07:45",
                departureTime: "07:50",
                sequence: 2
            }
        ],
        schedule: {
            startTime: "07:30",
            endTime: "08:30",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
    }
];

module.exports = mockRoutes;
