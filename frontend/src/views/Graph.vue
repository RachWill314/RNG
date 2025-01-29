<template>
    <canvas id="myChart"></canvas>
    <v-container fluid align="center">
        <v-row justify="center" style="max-width: 1200px;">
            <v-col cols="12" align="center">
                <!-- Content for the first column -->
                <VBtn text="Refresh Graph" flat color="secondary" variant="outlined" @click="updateGraph()"></VBtn>
            </v-col>
            <v-col cols="12" align="center">
                <!-- Content for the second column -->
                <VCard class="ma-2" subtitle="LED A" width="150" flat border align="center">
                    <VCardItem class="pa-0">Turned on </VCardItem>
                    <VCardItem class="pa-0"><span class="text-h5 text-primary font-weight-bold">{{ led_A }}</span>
                    </VCardItem>
                    <VCardItem class="pa-0"> times</VCardItem>
                    <VCardItem>
                        <VBtn text="Update" class="ma-1 text-caption" rounded="pill" flat color="secondary"
                            variant="tonal" @click="updateLEDCount('ledA')"></VBtn>
                    </VCardItem>
                </VCard>
            </v-col>
        </v-row>
        <v-row class="mt-5 mb-5" style="max-width: 1200px;">
            <v-divider></v-divider>
        </v-row>
        <v-row justify="center" style="max-width: 1200px;">
            <!-- Content for the third row -->
            <VCard class="ma-2" subtitle="LED B" width="150" flat border align="center">
                <VCardItem class="pa-0">Turned on </VCardItem>
                <VCardItem class="pa-0"><span class="text-h5 text-primary font-weight-bold">{{ led_B }}</span>
                </VCardItem>
                <VCardItem class="pa-0"> times</VCardItem>
                <VCardItem>
                    <VBtn text="Update" class="ma-1 text-caption" rounded="pill" flat color="secondary" variant="tonal"
                        @click="updateLEDCount('ledB')"></VBtn>
                </VCardItem>
            </VCard>
        </v-row>
    </v-container>
</template> 

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMqttStore } from '@/store/mqttStore';
//import Highcharts from 'highcharts';
import Chart from 'chart.js/auto';
import { useAppStore } from "@/store/appStore";

const router = useRouter();
const route = useRoute();

const AppStore = useAppStore();
const Mqtt = useMqttStore();

const led_A = ref(0); // Store count for LED A
const led_B = ref(0); // Store count for LED B
let chart = null; // Chart object
const data = {
    labels: ['Red', 'Blue'],
    datasets: [
        {
            label: 'Fully Rounded',
            data: [0, 0],
            borderColor: '#1ECBE1',
            backgroundColor: '#4BD5E7',
            borderWidth: 2,
            borderRadius: 5,
            borderSkipped: false,
        }]
};
const config = {
    type: 'bar',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart'
            }
        }
    },
};

onMounted(() => {
    // THIS FUNCTION IS CALLED AFTER THIS COMPONENT HAS BEEN MOUNTED
    CreateCharts();
    Mqtt.connect(); // Connect to Broker located on the backend
    setTimeout(() => {
        // Subscribe to each topic
        Mqtt.subscribe("620155671_sub");
        Mqtt.subscribe("topic2");
    }, 3000);
    const ctx = document.querySelector('#myChart'); // Select canvas for rendering chart
    chart = new Chart(ctx, config); // create chart
});

onBeforeUnmount(() => {
    // THIS FUNCTION IS CALLED RIGHT BEFORE THIS COMPONENT IS UNMOUNTED
    // unsubscribe from all topics
    Mqtt.unsubscribeAll();
});

const CreateCharts = async () => {
  const ctx = document.getElementById('ledChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      datasets: [{
        label: '',
        data: [led_A.value, led_B.value],
        backgroundColor: ['#FF6384', '#36A2EB'],
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of times LED on',
            color: '#000000'
          },
          ticks: {
            callback: function(value) {
              return value + ' times';
            }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'LEDs',
          align: 'left'
        }
      }
    }
  });
};

// Update graph with labels and new data
const updateData = (chart, label, newData) => {
    chart.data.labels = label;
    chart.data.datasets[0].data = newData;
    chart.update();
}

// FUNCTIONS
// Fetch new data and update graph
const updateGraph = async () => {
    let result = await AppStore.getFrequencies();
    let labels = [];
    let data = [];
    if (result.length > 0) {
        result.forEach(obj => {
            labels.push(obj["number"])
            data.push(obj["frequency"])
        });
        updateData(chart, labels, data);
    }
}
// Fetch new data and update cards
const updateLEDCount = async (name) => {
    let result = await AppStore.getOnCount(name);
    // console.log(result);
    if (name == "ledA") {
        led_A.value = result;
    }
    if (name == "ledB") {
        led_B.value = result;
    }

// Update the chart data
//   chart.data.datasets[0].data = [led_A.value, led_B.value];
//   chart.update();
}

// const refreshGraph = () => {
//   updateLEDCount('ledA');
//   updateLEDCount('ledB');
// };

</script>

<style scoped>
/* Add any additional styles here */
</style>