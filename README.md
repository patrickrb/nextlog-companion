# Nextlog Companion

A desktop companion application for [Nextlog](https://nextlog.app) ham radio logging, built with Electron, React, TypeScript, and TailwindCSS.

## Features

- **Radio Integration**: Connect to FlexRadio 6000 series radios via CAT/DAX protocols
- **Live Data Display**: Real-time frequency, mode, power, and band information
- **Nextlog Integration**: Send contact data directly to your Nextlog logging website
- **WSJT-X Support**: Automatic contact logging from WSJT-X digital modes
- **Modular Design**: Extensible architecture for adding support for additional radio brands

## Supported Radios

### Currently Supported
- FlexRadio 6000 Series (6400, 6400M, 6500, 6600, 6600M, 6700)

### Planned Support
- Yaesu (Coming Soon)
- Icom (Coming Soon)
- Kenwood (Coming Soon)

## Prerequisites

- Node.js 18+ and npm
- For FlexRadio: SmartSDR software running
- For WSJT-X: WSJT-X with UDP messaging enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextlog-companion
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Building

### Development Build
```bash
npm run build
```

### Production Packages
```bash
# Build for current platform
npm run package

# Build for specific platforms
npm run package:mac
npm run package:win
npm run package:linux
```

## Configuration

### FlexRadio Setup

1. Ensure SmartSDR is running on your FlexRadio
2. Note your radio's IP address (usually 192.168.1.100)
3. In the app, go to the Connection tab
4. Select "FlexRadio 6000 Series"
5. Enter your radio's IP address and port (default: 4992)
6. Click "Connect"

### WSJT-X Setup

1. Open WSJT-X preferences
2. Go to the "Reporting" tab
3. Enable "Accept UDP requests"
4. Set UDP Server port to 2237
5. Restart WSJT-X
6. The app will automatically detect WSJT-X when it's running

### Nextlog Integration

1. Go to the Nextlog tab in the app
2. Fill in contact details (callsign is required)
3. Radio data (frequency, mode, band, power) is automatically populated
4. Click "Send to Nextlog" to submit the contact

## Project Structure

```
nextlog-companion/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── services/         # Backend services
│   │   ├── drivers/          # Radio drivers
│   │   ├── main.ts           # Main process entry
│   │   └── preload.ts        # Preload script
│   ├── renderer/             # React frontend
│   │   └── src/
│   │       ├── components/   # React components
│   │       ├── lib/          # Utilities
│   │       └── App.tsx       # Main app component
│   └── types/                # TypeScript definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Architecture

### Radio Driver System

The app uses a modular driver architecture that makes it easy to add support for new radio types:

1. **RadioDriver Interface**: Defines the contract all radio drivers must implement
2. **RadioService**: Manages driver instances and handles connection/disconnection
3. **Specific Drivers**: Implement the RadioDriver interface for each radio type

To add a new radio driver:

1. Create a new driver class in `src/main/drivers/`
2. Implement the `RadioDriver` interface
3. Add the driver to the `RadioService.createDriver()` method
4. Add the radio type to the UI dropdown

### Services

- **RadioService**: Manages radio connections and data flow
- **NextlogService**: Handles communication with Nextlog API
- **WSJTXService**: Listens for WSJT-X UDP messages

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

## API Integration

### Nextlog API

The app includes a service for integrating with the Nextlog API. The current implementation includes:

- Contact data submission
- Connection testing
- Error handling

To implement the actual API calls, update the `NextlogService` class with your Nextlog API endpoints and authentication.

### WSJT-X Protocol

The app implements a UDP listener for the WSJT-X protocol to automatically capture logged contacts. Supported message types:

- Status messages
- Decode messages
- QSO logged messages
- ADIF logged messages

## Troubleshooting

### FlexRadio Connection Issues

1. Verify SmartSDR is running
2. Check that your computer is on the same network as the radio
3. Verify the IP address and port (default: 4992)
4. Check firewall settings

### WSJT-X Not Detected

1. Ensure WSJT-X is running
2. Verify UDP messaging is enabled in WSJT-X preferences
3. Check that port 2237 is not blocked by firewall
4. Restart WSJT-X after changing settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Roadmap

- [ ] Additional radio manufacturer support (Yaesu, Icom, Kenwood)
- [ ] Contest logging features
- [ ] QSL card management integration
- [ ] Band/mode activity statistics
- [ ] Custom logging fields
- [ ] Import/export functionality
- [ ] Mobile companion app