# Project Rules & Design System Guidelines

## HP Standard Enterprise UI / Dashboard Button Color Specification (HP 按钮主体色规范)

All future UI/UX designs and code implementations must strictly adhere to the following button color and style tokens based on HP Enterprise UI standards (Pure White Canvas + `#024AD8` Primary + `#F7F7F7` Gray Scale).

### Core Principle
In enterprise UI / Dashboards, button core logic uses "Visual Weight" to express operation "Risk Level and Importance".

---

### 1. Primary Colors (主色系)
At most **1 Primary Button** per screen/page view to avoid competing visual focus.
* **Primary Default (核心响应)**: `#024AD8` (HP Electric Blue)
  * Text / Icon: `#FFFFFF`
  * Corner Radius: `4px` (`rounded-[4px]`)
  * Border: `none`
  * Use cases: Save, Submit, Create, Next, Confirm Publish, etc.
* **Primary Hover**: `#003198` (15%-20% darker than primary)
* **Primary Active**: `#00226B`
* **Primary Disabled**: `#E2E2E2` (Text/Icon: `#9E9E9E`, `cursor: not-allowed`)

### 2. Secondary & Neutral Colors (次要与中性色系)
Covers ~80% of all UI buttons for secondary, parallel, or standard actions.

#### Secondary / Outline (次要/线框按钮)
* Background: `#FFFFFF` (Pure white)
* Border: `1px solid #D1D1D1`
* Text / Icon: `#1C1C1C` (HP Dark Charcoal)
* Hover: Background `#F7F7F7`, Border `#B0B0B0`
* Use cases: Cancel, Back, Reset, Export, Secondary "View Details".

#### Tertiary / Ghost / Text (三级/文本/幽灵按钮)
* Background: `transparent`
* Border: `none`
* Text / Icon: `#024AD8` (Primary blue text) or `#1C1C1C`
* Hover: Background `#EFF4FF` (very light blue) or `#F7F7F7` (light gray)
* Use cases: Table row actions (e.g. "Edit", "Expand"), Breadcrumb links, Footer links.

---

### 3. Semantic Colors (语义与功能色系)
Used strictly for risk, destruction, or explicit state actions. Do not use high saturation colors arbitrarily.

#### Danger / Destructive (危险/破坏性按钮)
* **Primary Danger (强危险 - 如删除不可逆)**:
  * Background: `#D32F2F` (Crimson Red)
  * Text: `#FFFFFF`
  * Hover: `#B71C1C`
* **Secondary Danger (弱危险 / 常规删除)**:
  * Background: `transparent` or `#FFF2F2` (Light Red)
  * Text: `#D32F2F`
  * Border: `1px solid #FFCDD2`
  * Use cases: Delete account, Clear database, Stop running service.

---

### 4. Button Token Token Matrix (对照表)

| Button Type | State | Background | Text/Icon | Border | Radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | Normal | `#024AD8` | `#FFFFFF` | None | 4px |
| | Hover | `#003198` | `#FFFFFF` | None | 4px |
| | Active | `#00226B` | `#FFFFFF` | None | 4px |
| **Secondary** | Normal | `#FFFFFF` | `#1C1C1C` | `1px solid #D1D1D1` | 4px |
| | Hover | `#F7F7F7` | `#1C1C1C` | `1px solid #B0B0B0` | 4px |
| **Ghost/Text**| Normal | `transparent` | `#024AD8` | None | 4px |
| | Hover | `#EFF4FF` | `#024AD8` | None | 4px |
| **Danger** | Normal | `#D32F2F` | `#FFFFFF` | None | 4px |
| | Hover | `#B71C1C` | `#FFFFFF` | None | 4px |
| **Disabled** | Any | `#E2E2E2` | `#9E9E9E` | None | 4px |

---

### 5. Mandatory Quality & Accessibility Rules
1. **Focus State (键盘焦点)**: Tab focus on any button MUST render an explicit outline: `outline: 2px solid #024AD8; outline-offset: 2px;`.
2. **Corner Radius**: Standard buttons MUST use `4px` radius (`rounded-[4px]`). Large radii (16px+) are reserved strictly for Cards and Container wrappers.
