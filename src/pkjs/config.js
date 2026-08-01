module.exports = [
  {
    "type": "heading",
    "defaultValue": "Display Settings"
  },
  {
    "type": "text",
    "defaultValue": "Customize elements of the FUTÁR display simulation"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "The Important Part"
      },
      {
        "type": "toggle",
        "messageKey": "showSeconds",
        "label": "Show seconds on clock row", // even when not shaken
        "defaultValue": false
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Data Source"
      },
      {
        "type": "text",
        "defaultValue": "IRL display installation to simulate"
      },
      {
        "type": "select",
        "messageKey": "chosenSpot",
        "label": "Spot",
        "defaultValue": "CLARK0",
        "options": [
          {
            "label": "Clark Ádám tér (2/16-105-178-210/B towards Castle Hill and tunnel)",
            "value": "CLARK0"
          },
          {
            "label": "Batthyány tér M+H (middle of square)",
            "value": "BATYI0"
          }
        ]
      },
      {
        "type": "toggle",
        "messageKey": "choseBackFace",
        "label": "Back face display (only affects arrows pointing at stands)",
        "defaultValue": false
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
]