<template>
    <div class="echart-img">
        <div :id="type" :style="{width: '100%', height: height+'px'}"></div>    // 宽高可以自适应
        <a :class="type" :download="type"  href="#" style="position:absolute;bottom: 10%;right:50px;">
          <img :src="down" alt="">
          <span>DownLoad</span>
        </a>
    </div>
</template>
<script>
import echarts from "@/plugins/echarts/index";
import { CanvasRenderer } from 'echarts/renderers';
import { toRefs,watch, onMounted, onUnmounted } from "vue";
import  down from '@/assets/svg/download.svg'
export default {
    props: {
      type: {
          type: String,
          default: ''
      },
      height: {
        type: String,
        default: ''
      },
      echartData:{
        type: Object,
        default:()=>{}
      },
      timeData:{
        type: Array,
        default: ()=>[]
      }
  },
    setup(props){
        let echartInstance;
        let legendData = []
        let seriesData=[]
        echarts.use([
          CanvasRenderer
        ])
        watch(props,function(){
          legendData = []
          seriesData = []
          for(let attr in props.echartData){
            seriesData.push({
              name: attr,
              data: props.echartData[attr],
              type: 'line',
              smooth: true
            })
            legendData.push(attr)
          }
          initechartInstance()
        })
        onMounted(() => {
          window.addEventListener('resize',function(){
            echartInstance.resize()
          },false)
        })
        function initechartInstance(){
           const echartDom = document.getElementById(""+props.type);
            if (!echartDom) return;
            echartInstance = echarts.init(echartDom)
            echartInstance.setOption({
              tooltip: {
                trigger: 'axis'
              },
              legend: {
                data: legendData,
                bottom: '10%',
                icon: 'pin'
              },
              grid: {
                left: '3%',
                right: '7%',   // 右侧距离，避免展示不全
                bottom: '30%',
                containLabel: true
              },
              toolbox: {
                bottom: '10%',
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: props.timeData,
                axisLabel: {
                  show: true,
                  interval: 0,
                }
              },
              yAxis: [
                {
                  type: 'value'
                }
              ],
              dataZoom: [
                {
                  type: 'inside'
                }
              ],
              series: seriesData
            });
            echartInstance.on('finished', function () {
              var snapshotImage = new Image();
              snapshotImage.src = echartInstance.getDataURL();
              document.getElementsByClassName(""+props.type)[0].href = echartInstance.getDataURL();
            });
          }
        return{
            down,
            ...toRefs(props)
        }
    }
}
</script>

<style lang="less" scoped>
  .echart-img{
    display: flex;
    align-items: flex-end;
    position: relative;
    a{
      color: #3F9EFF;
      line-height: 22px;
      display: flex;
      align-items: center;
      img {
        margin-right: 5px;
      }
    }
  }
</style>
