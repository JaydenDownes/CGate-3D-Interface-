
# CBUS CGate Smart Home 3D Interface

The CBUS 3D Interface is a web-based application designed for Clipsal CBUS Lighting Control Systems. This user-friendly interface allows users to control lights and other appliances, create scenes, and schedule actions, all within a 3D environment generated from your preferred CAD software.

## Features

- 3D Web Interface: Control your Clipsal CBUS Lighting Control System through a user-friendly and interactive 3D web-based interface.

- Device Control: Turn lights and other appliances on/off or adjust their brightness levels using the 3D map.

- Scene Creation: Create custom scenes to set specific lighting configurations and apply them easily with a single click.

- Scheduling: Schedule actions for your lighting and appliances to automate their behavior based on your preferences.

- Integration with CGate: Seamlessly interact with the CGate to gain access to your Clipsal CBUS system.

## To do:

- [ ] Fix inproper lighting throughout scenes
- [ ] Allow for keypoints on each room for a close up view of all devices
- [ ] Change controls to a primary control per room and seceondary controls by clicking on each device
- [ ] Show ON/OFF or lighting dim percentage above each room (optional)
- [ ] Add-on for Google Assistant 
- [ ] Ability to disable UI and configure directly through configuration files and CLI

Additon of extra devices (Including vendors outside of Cbus):
  - [ ] Access Control
  - [ ] Air Purifiers
  - [ ] Air Quality Sensors
  - [ ] Contact Sensors
  - [ ] Dorbells
  - [ ] Garage door opener
  - [ ] Heating and Cooling controls (Including evaporative)
  - [ ] Humidifier/Dehumidifier
  - [ ] Irrigation systsem
  - [ ] Leak Sensors
  - [ ] Light Sensors
  - [ ] Motion Sensors
  - [ ] Power Management
  - [ ] Security System
  - [ ] Thermostats
  - [ ] Window / Blinds control

## Install dependancies:
1) NPM, Download and Install from:
> https://nodejs.org/en/download/


2) NPM Modules: (Run as Administrator in Powershell or CMD)
```bash
  npm install carrier@0.3.0 cron@2.4.0 express@4.18.2 moment-timezone@0.5.43 moment@2.29.4 request@2.88.2 socket.io@4.7.1 suncalc@1.9.0 underscore@1.13.6

```
3) Download, Install & Setup Clipsal CGate from:
> https://updates.clipsal.com/ClipsalSoftwareDownload/mainsite/cis/technical/downloads/c-gate.html


## Installation (Windows)
1) Download & Extract ZIP file from Github.

2) Open Powershell or CMD as Administrator and navigate to Extracted Folder

3) Run npm installation:
```bash
npm install
```
4) Edit Configuration Files (config.js, db.json)

#### config.js: (example) 
```bash
 var config = {
  cgate: {
    host: '0.0.0.0',
    contolport: 20023,
    eventport: 20024,
    statusport: 20025,
    cbusname: 'STANFOR2',
    network: 254,
    application: 56
  },
  webserver: {
    port: 8080,
    host: '0.0.0.0'
  },
  location: {
    latitude: '31.9523',
    longitude: '115.8613',
    timezone: 'Australia/Perth'
  }
 };

module.exports = config;
```

#### db.json: (example) 
```bash
{
    "tasks": [
        {
            "id": "1",
            "enabled": true,
            "name": "Turn on night lights",
            "cronstring": "0 5 * * *",
            "expression": "",
            "commands": [
                {
                    "type": "lighting",
                    "group": "30",
                    "level": 100,
                    "delay": 0,
                    "timeout": 28800
                }
            ]
        }
    ],
    "rules": [
        {
            "id": "1",
            "enabled": true,
            "name": "Late night hall motion",
            "expression": "group=='95' && level > 0 && (time > '22:00' || time < dawn)",
            "commands": [
                {
                    "type": "lighting",
                    "group": "46",
                    "level": 20,
                    "delay": 0,
                    "timeout": 90
                }
            ]
        }
    ],
    "scenes": [
        {
            "id": "1",
            "name": "Party Mode",
            "commands": [
                {
                    "type": "lighting",
                    "group": "20",
                    "level": 20,
                    "delay": 0,
                    "timeout": 0
                }
            ]
        }
    ],
    "devices": {
        "0": {
            "name": "Flood",
            "location": "Outdoor",
            "level": 0,
            "lastchange": null,
            "type": "lighting",
            "visible": true,
            "vendor": "cbus"
        }
    }
}

```

5) Run server:
```bash
node server.js
```

## Usage
### Server Endpoints:
#### GET `/light-interface/cgate`: Retrieve CGate Information

Retrieve information about the CGate interface.

##### Example

```
GET /light-interface/cgate HTTP/1.1
Host: your-server-domain.com
```

#### GET `/light-interface/cmd`: Send a Command to the Light Interface

Send a specific command to control the light interface.

##### Example

```
GET /light-interface/cmd?command=turnOn&deviceID=1 HTTP/1.1
Host: your-server-domain.com
```

#### GET `/light-interface/locations`: Get Locations Associated with the Light Interface

Retrieve the locations associated with the light interface.

##### Example

```
GET /light-interface/locations HTTP/1.1
Host: your-server-domain.com
```

#### GET `/light-interface/scenes`: Retrieve Scenes for the Light Interface

Retrieve the scenes available for the light interface.

##### Example

```
GET /light-interface/scenes HTTP/1.1
Host: your-server-domain.com
```

#### GET `/light-interface/devices`: Retrieve Devices for the Light Interface

Retrieve the devices connected to the light interface.

##### Example

```
GET /light-interface/devices HTTP/1.1
Host: your-server-domain.com
```


## Future Updates
- The CBUS 3D Interface is an ongoing project, and future updates will bring exciting new features and improvements. Some of the planned updates include:

- Expanded Device Control: Ability to control devices beyond lighting, such as Aircons and other logic-based appliances.

- Web-Based Installation/Setup Wizard: Streamlined setup process with a user-friendly installation wizard.

- RGB and DMX Fixture Control: Enhanced support for controlling RGB or DMX fixtures to provide advanced lighting options.

- Integrated Map for Scheduling: An integrated map feature to facilitate easy scheduling of actions based on location.

- Viewpoint Box: The addition of a viewpoint box to change views of the 3D map for better user interaction.

- Slider for 3D Map: Implement a slider functionality to manipulate the 3D map for precise adjustments.

- Configurable Home Camera Position: Allow users to configure the home camera position within the 3D map for personalized perspectives.

- Day/Night Mode: Introduce a day/night mode option, including an auto mode, for adjusting the interface's appearance based on the time of day.


## Feedback

If you have any feedback, please raise an **Issue** in the Issues Tab on Github


## Acknowledgements

 - API to communicate between Frontend and CGate :
   [node-cbus]([https://github.com/anthonywebb/node-cbus])
   
 - webGL Three.js 3D Interface
   [web_three_interface]([https://github.com/HomeSmartMesh/web_three_interface])


## Authors

- [@JaydenDownes](https://github.com/JaydenDownes)

