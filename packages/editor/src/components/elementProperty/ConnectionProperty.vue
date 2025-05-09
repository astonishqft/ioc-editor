<script setup lang="ts">
import { ref } from 'vue'
import { ElColorPicker, ElDivider, ElInput, ElInputNumber, ElOption, ElSelect } from 'element-plus'
import { ConnectionType } from '@tiny-flowchart/core'
import { lineTypeOpt, strokeColorList, lineWidthOpts } from './config'

import type {
  LineDashStyle,
  IConnection,
  ITinyFlowchart,
  IExportConnectionStyle
} from '@tiny-flowchart/core'

const { tinyFlowchart } = defineProps<{
  tinyFlowchart: ITinyFlowchart
}>()

const lineTypes = [
  {
    value: ConnectionType.OrtogonalLine,
    label: '折线'
  },
  {
    value: ConnectionType.Line,
    label: '直线'
  },
  {
    value: ConnectionType.BezierCurve,
    label: '曲线'
  }
]

const connectionConfig = ref<IExportConnectionStyle>({
  stroke: '#1e1e1e',
  lineWidth: 1,
  lineDash: 'solid',
  fontColor: '#333',
  text: 'title',
  fontSize: 12,
  fontWeight: 'normal',
  fontStyle: 'normal'
})

const activeConnection = ref<IConnection | null>(null)
const lineType = ref<ConnectionType>(ConnectionType.OrtogonalLine)

tinyFlowchart._connectionMgr.updateSelectConnection$.subscribe((connection: IConnection) => {
  activeConnection.value = connection
  connectionConfig.value.stroke = connection.getLineColor()
  connectionConfig.value.lineWidth = connection.getLineWidth()
  connectionConfig.value.lineDash = connection.getLineDash()
  connectionConfig.value.text = connection.getLineTextContent()
  connectionConfig.value.fontSize = connection.getLineTextFontSize() as number
  connectionConfig.value.fontColor = connection.getLineTextFontColor()
  connectionConfig.value.fontStyle = connection.getLineFontStyle()
  connectionConfig.value.fontWeight = connection.getLineFontWeight()
  lineType.value = connection.getConnectionType()
})

const changeLineColor = (color: string | null) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.stroke = color as string
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}

const changeLineWidth = (width: number) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.lineWidth = width
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}

const changeLineDash = (type: string) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.lineDash = type as LineDashStyle
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}
const changeLinkFontColor = (color: string | null) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.fontColor = color as string
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}

const changeLineFontStyle = (style: string) => {
  const fWeight = activeConnection.value?.getLineFontWeight() || 'normal'
  const fStyle = activeConnection.value?.getLineFontStyle() || 'normal'
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  if (style === 'fontWeight') {
    tinyFlowchart.execute('updateConnectionProperty', {
      connection: activeConnection.value as IConnection,
      connectionConfig: { ...connectionConfig.value },
      oldConnectionConfig
    })
    connectionConfig.value.fontWeight = fWeight === 'normal' ? 'bold' : 'normal'
  } else {
    tinyFlowchart.execute('updateConnectionProperty', {
      connection: activeConnection.value as IConnection,
      connectionConfig: { ...connectionConfig.value },
      oldConnectionConfig
    })

    connectionConfig.value.fontStyle = fStyle === 'normal' ? 'italic' : 'normal'
  }
}

const changeLineTextContent = (text: string) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.text = text
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}

const changeLineFontSize = (size: number | undefined) => {
  const oldConnectionConfig = { ...activeConnection.value?.getExportData().style }
  connectionConfig.value.fontSize = size
  tinyFlowchart.execute('updateConnectionProperty', {
    connection: activeConnection.value as IConnection,
    connectionConfig: { ...connectionConfig.value },
    oldConnectionConfig
  })
}

const changeLineType = (type: ConnectionType) => {
  const oldLineType = activeConnection.value?.getConnectionType()
  lineType.value = type
  tinyFlowchart.execute('changeConnectionType', {
    connection: activeConnection.value as IConnection,
    lineType: type,
    oldLineType
  })
}
</script>
<template>
  <div class="property-container">
    <div class="property-item">
      <div class="property-name">线条颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeLineColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker
          v-model="connectionConfig.stroke as string"
          @change="changeLineColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条宽度</div>
      <div class="property-value">
        <el-select
          v-model="connectionConfig.lineWidth"
          size="small"
          style="margin-left: 2px"
          @change="changeLineWidth"
        >
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="connectionConfig.lineDash"
          size="small"
          style="margin-left: 2px"
          @change="changeLineDash"
        >
          <el-option
            v-for="item in lineTypeOpt"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="line-type" :class="item.value"></div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">连线方式</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="lineType"
          size="small"
          style="margin-left: 2px"
          @change="changeLineType"
        >
          <el-option
            v-for="item in lineTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="line-type" :class="item.value">{{ item.label }}</div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeLinkFontColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker
          v-model="connectionConfig.fontColor as string"
          @change="changeLinkFontColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="connectionConfig.text"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @input="changeLineTextContent"
          style="margin-left: 2px"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字大小</div>
      <div class="property-value">
        <el-input-number
          v-model="connectionConfig.fontSize as number"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeLineFontSize"
          style="margin-left: 2px; width: 100%"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字样式</div>
      <div class="property-value">
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_jiacu"
          :class="{ active: connectionConfig.fontWeight === 'bold' }"
          :title="'加粗'"
          @click="() => changeLineFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: connectionConfig.fontStyle === 'italic' }"
          :title="'斜体'"
          @click="() => changeLineFontStyle('fontStyle')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.property-container {
  padding: 10px 15px 10px 15px;
  .property-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
    .property-name {
      width: 58px;
      font-size: 12px;
      display: flex;
      justify-content: flex-start;
    }
    .color-wrapper {
      display: flex;
      width: calc(100% - 58px);
      justify-content: space-between;
    }
    .property-value {
      width: calc(100% - 58px);
      .color-item {
        width: 20px;
        height: 20px;
        margin: 2px;
        cursor: pointer;
        border-radius: 5px;
        border: 1px solid rgb(217, 217, 217);
        display: inline-block;
      }
    }
  }
}
.line-type {
  height: 15px;
}
.solid {
  border-bottom: 1px solid #000;
}
.dashed {
  border-bottom: 1px dashed #000;
}
.dotted {
  border-bottom: 1px dotted #000;
}
.font-style-icon {
  font-size: 18px;
  margin-right: 8px;
  padding: 3px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 5px;
}
.font-style-icon.active {
  background-color: #1971c2;
  color: #fff;
}
</style>
