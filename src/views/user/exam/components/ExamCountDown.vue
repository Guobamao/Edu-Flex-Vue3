<template>
    <div>
        距离考试结束还有：
        <span style="color: #ff0000; font-weight: bold;">
            {{ min }}分钟{{ sec }}秒
        </span>
    </div>
</template>

<script setup name="ExamCountDown">

const props = defineProps({
    modelValue: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['timeout'])

const leftSeconds = ref(props.modelValue)
const min = ref('00')
const sec = ref('00')

watch(() => props.modelValue, (newValue) => {
    leftSeconds.value = newValue
    countdown()
})
// 进行倒计时
function countdown() {
    // 倒计时结束
    if (leftSeconds.value < 0) {
        emit('timeout')
        return
    }

    // 时
    const m = parseInt(leftSeconds.value / 60)
    const s = parseInt(leftSeconds.value % 60)

    min.value = m > 9 ? m : '0' + m
    sec.value = s > 9 ? s : '0' + s
    leftSeconds.value--

    setTimeout(() => {
        countdown()
    }, 1000)
}
</script>