<template>
  <div class="h-full">
    <div class="app-container h-full transition-colors duration-300 dark:bg-dark-background bg-white">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-left">
          <div class="logo-container">
            <!-- Embed SVG directly instead of using img tag -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 849.6 329.92" class="w-20 h-20">
              <g id="layer_2">
                <text transform="translate(5.52 250.66)">gtuner</text>
                <polygon points="60.34 198.02 84.8 150.91 107.45 198.02 60.34 198.02"/>
                <polygon/>
              </g>
              <g id="layer_3">
                <text transform="translate(5.52 250.66)">gtuner</text>
                <polygon points="60.34 198.02 84.8 150.91 107.45 198.02 60.34 198.02"/>
              </g>
              <g id="logo">
                <text transform="translate(5.52 250.66)">gtuner</text>
                <polygon points="60.34 198.02 84.8 150.91 107.45 198.02 60.34 198.02"/>
              </g>
            </svg>
          </div>
          <div class="a4-reference" @click="changeA4">
            A<sub>4</sub> = <span>{{ a4 }}</span> Hz
          </div>
        </div>
        
        <div class="navbar-right">
          <!-- Auto toggle button with improved spacing -->
          <div class="auto-toggle-wrapper">
            <div class="auto-toggle-label dark:text-dark-text text-gray-800">
              Auto Detection
            </div>
            <button 
              @click="toggleAutoMode"
              class="auto-toggle-button mt-2" 
              :class="{ 'active': isAutoMode }"
              :aria-checked="isAutoMode"
              role="switch"
              aria-label="Toggle auto detection mode"
            >
              <div class="auto-toggle-track"></div>
              <div class="auto-toggle-thumb">
                <svg v-if="isAutoMode" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
          
          <!-- Theme Toggle Button -->
          <button 
            @click="toggleTheme" 
            class="theme-toggle"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun icon for light mode -->
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <!-- Moon icon for dark mode -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
        </div>
      </nav>
      
      <canvas ref="frequencyBars" class="frequency-bars"></canvas>
      
      <div class="meter">
        <div class="meter-dot"></div>
        <div 
          class="meter-pointer transition-all duration-700 ease-out" 
          :class="[
            meterAccuracy === 'perfect' ? 'bg-green-500 dark:bg-green-400' : 
            meterAccuracy === 'close' ? 'bg-yellow-500 dark:bg-yellow-400' : 
            'bg-red-500 dark:bg-red-400'
          ]"
          :style="{ transform: `rotate(${meterRotation}deg)` }"
        ></div>
      </div>
      
      <!-- Tuning status indicator - moved below meter -->
      <div v-if="!isAutoMode" :class="['tuning-indicator', meterAccuracy]">
        {{ 
          meterAccuracy === 'perfect' ? 'Perfect! 👍' : 
          meterAccuracy === 'close' ? 'Almost there...' : 
          'Keep tuning...'
        }}
      </div>
      
      <!-- Frequency display -->
      <div class="frequency-display">
        <div class="frequency">
          {{ currentFrequency.toFixed(1) }}<span>Hz</span>
        </div>
        <div class="current-note">
          {{ currentNote?.name }}{{ currentNote?.sharp ? '♯' : '' }}{{ currentNote?.octave }}
        </div>
      </div>
      
      <!-- Note selection buttons - shown when Auto is disabled -->
      <div v-if="!isAutoMode" class="note-buttons fixed bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-1 w-full max-w-xl px-2">
        <button 
          v-for="note in safeCommonNotes" 
          :key="note.name + note.octave"
          @click="selectNote(note)"
          :class="{ 'ring-2 ring-primary': currentNote?.name === note.name && currentNote?.octave === note.octave }"
          class="px-2 py-1 rounded-lg bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <div class="font-semibold text-sm">{{ note.name }}{{ note.sharp ? '#' : '' }}{{ note.octave }}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">{{ note.frequency.toFixed(1) }}Hz</div>
        </button>
      </div>
      
      <!-- Footer with attribution -->
      <div class="footer-attribution">
        <span>Based on <a href="https://github.com/qiuxiang/tuner" target="_blank" rel="noopener noreferrer">@qiuxiang/tuner</a> and changed by <a href="https://guisso.dev" target="_blank" rel="noopener noreferrer">guisso</a>.</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'

// Import our utility classes (these will be converted from the original JS files)
import { Tuner } from './utils/tuner.js'
import { FrequencyBars } from './utils/frequency-bars.js'
import { createNotes, noteStrings, getFrequencyFromNoteValue } from './utils/notes.js'

export default {
  name: 'App',
  setup() {
    // Initialize refs
    const a4 = ref(localStorage.getItem('a4') ? parseInt(localStorage.getItem('a4')) : 440)
    const tuner = ref(null)
    const frequencyBars = ref(null)
    const frequencyData = ref(null)
    const notesList = ref([])
    const currentNote = ref(null)
    const currentFrequency = ref(a4.value)
    const isAutoMode = ref(false)
    const lastNote = ref(null)
    const meterRotation = ref(0)
    
    // Common guitar notes for quick selection
    const commonNotes = ref([
      { name: 'E', octave: 2, frequency: 0, sharp: false, value: 28 }, // Low E
      { name: 'A', octave: 2, frequency: 0, sharp: false, value: 33 }, // A
      { name: 'D', octave: 3, frequency: 0, sharp: false, value: 38 }, // D
      { name: 'G', octave: 3, frequency: 0, sharp: false, value: 43 }, // G
      { name: 'B', octave: 3, frequency: 0, sharp: false, value: 47 }, // B
      { name: 'E', octave: 4, frequency: 0, sharp: false, value: 52 }  // High E
    ])
    
    // Theme state
    const isDarkMode = ref(localStorage.getItem('theme') === 'light' ? false : true)
    
    // Meter accuracy indicator
    const meterAccuracy = ref('far') // 'perfect', 'close', or 'far'
    
    // Computed for easy access to frequency bars element
    const frequencyBarsEl = ref(null)
    
    // Computed property for safe access to common notes
    const safeCommonNotes = computed(() => {
      return Array.isArray(commonNotes.value) ? commonNotes.value : [];
    });
    
    // Computed property for filtered notes - only show notes within guitar range
    const filteredNotes = computed(() => {
      if (!Array.isArray(notesList.value)) return [];
      
      // Filter notes to show only those in range of a typical guitar (E2 to E6)
      return notesList.value.filter(note => {
        // Guitar range is roughly E2 (82Hz) to E6 (1318Hz)
        const minFreq = 80;  // Just below E2
        const maxFreq = 1320; // Just above E6
        
        return note.frequency >= minFreq && note.frequency <= maxFreq;
      });
    });
    
    // Update the common notes' frequencies based on a4
    const updateCommonNotesFrequencies = () => {
      try {
        commonNotes.value.forEach(note => {
          note.frequency = getFrequencyFromNoteValue(note.value, a4.value)
          console.log(`Updated ${note.name}${note.octave} frequency to ${note.frequency}Hz`)
        })
      } catch (error) {
        console.error('Error updating common notes frequencies:', error)
      }
    }
    
    // Toggle theme function
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
      
      // Apply dark class to the html element for Tailwind's dark mode to work
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // Initialize tuner and related objects
    const initTuner = () => {
      tuner.value = new Tuner(a4.value)
      
      // Add error handling for notesList initialization
      const createdNotes = createNotes(a4.value)
      console.log('createdNotes:', createdNotes, Array.isArray(createdNotes))
      
      if (Array.isArray(createdNotes)) {
        notesList.value = createdNotes
      } else {
        console.error('createNotes did not return an array:', createdNotes)
        notesList.value = [] // Fallback to empty array
      }
      
      updateCommonNotesFrequencies()
      
      // Set initial note to standard E4 (the high E string)
      const initialNote = commonNotes.value.find(note => note.name === 'E' && note.octave === 4)
      
      if (initialNote) {
        currentNote.value = { 
          ...initialNote,
          cents: 0
        }
        currentFrequency.value = initialNote.frequency
      } else {
        // Fallback to A4 if common notes not found
        currentNote.value = {
          name: 'A',
          frequency: a4.value,
          octave: 4,
          value: 69,
          cents: 0
        }
        currentFrequency.value = a4.value
      }
      
      // Set up note detection callback
      tuner.value.onNoteDetected = (note) => {
        // Update the frequency display regardless of mode
        currentFrequency.value = note.frequency
        
        // Calculate cents difference for accuracy assessment
        const targetFrequency = currentNote.value.frequency
        const centsDiff = Math.abs(note.cents)
        
        // Update meter color based on cents difference
        if (centsDiff < 5) {
          meterAccuracy.value = 'perfect'
        } else if (centsDiff < 30) {
          meterAccuracy.value = 'close'
        } else {
          meterAccuracy.value = 'far'
        }
        
        // Update meter rotation
        meterRotation.value = (note.cents / 50) * 45
        
        // In auto mode, also update the selected note
        if (isAutoMode.value) {
          if (lastNote.value === note.name) {
            updateNote(note)
          } else {
            lastNote.value = note.name
          }
        }
      }
      
      // Initialize the frequency bars
      frequencyBars.value = new FrequencyBars(frequencyBarsEl.value)
      
      // Start the tuner
      tuner.value.init()
      frequencyData.value = new Uint8Array(tuner.value.analyser.frequencyBinCount)
      
      // Start the animation loop
      updateFrequencyBars()
    }
    
    // Update the current note and meter
    const updateNote = (note) => {
      currentNote.value = note
      currentFrequency.value = note.frequency
      meterRotation.value = (note.cents / 50) * 45
      
      // Reset accuracy to be recalculated
      meterAccuracy.value = 'far'
    }
    
    // Update the frequency bars visualization
    const updateFrequencyBars = () => {
      if (tuner.value?.analyser) {
        tuner.value.analyser.getByteFrequencyData(frequencyData.value)
        frequencyBars.value?.update(frequencyData.value)
      }
      requestAnimationFrame(updateFrequencyBars)
    }
    
    // Handle manual note selection
    const selectNote = (note) => {
      isAutoMode.value = false
      
      // Make sure notesList.value is an array before using find
      if (Array.isArray(notesList.value)) {
        // Need to find the complete note information from the notesList
        const completeNote = notesList.value.find(n => 
          n.name === note.name && n.octave === note.octave
        )
        
        if (completeNote) {
          updateNote({
            ...completeNote,
            cents: 0 // Reset cents when manually selecting
          })
        } else {
          // If note not found in notesList, use the provided note directly
          updateNote({
            ...note,
            cents: 0
          })
        }
      } else {
        // If notesList is not an array, just use the note that was clicked
        console.error('notesList.value is not an array:', notesList.value);
        updateNote({
          ...note,
          cents: 0
        })
      }
    }
    
    // Handle changing the A4 reference frequency
    const changeA4 = async () => {
      const { value: newA4 } = await Swal.fire({
        title: 'Change A4 Reference',
        text: 'Enter new reference frequency for A4 (Hz)',
        input: 'number',
        inputValue: a4.value,
        confirmButtonText: 'Update',
        showCancelButton: true
      })
      
      if (!parseInt(newA4) || newA4 === a4.value) {
        return
      }
      
      a4.value = parseInt(newA4)
      localStorage.setItem('a4', a4.value)
      
      // Re-initialize with new A4
      if (tuner.value) {
        tuner.value.middleA = a4.value
        
        // Update all notes with new frequencies based on new A4
        const createdNotes = createNotes(a4.value)
        if (Array.isArray(createdNotes)) {
          notesList.value = createdNotes
          console.log(`All notes updated with new A4 reference: ${a4.value}Hz`)
        }
        
        // Update common notes
        updateCommonNotesFrequencies()
        
        // If a note is already selected, update its frequency
        if (currentNote.value) {
          const updatedNote = notesList.value.find(
            n => n.name === currentNote.value.name && n.octave === currentNote.value.octave
          )
          
          if (updatedNote) {
            updateNote({
              ...updatedNote,
              cents: 0
            })
          }
        }

        // Show success message
        Swal.fire({
          title: 'A4 Updated',
          text: `A4 reference frequency set to ${a4.value}Hz`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
    
    // Watch for theme changes to update the frequency bars colors
    watch(isDarkMode, () => {
      if (frequencyBars.value) {
        // Update the canvas if needed
        if (tuner.value?.analyser && frequencyData.value) {
          tuner.value.analyser.getByteFrequencyData(frequencyData.value)
          frequencyBars.value.update(frequencyData.value)
        }
      }
    })
    
    // Add a specific function for toggling auto mode
    const toggleAutoMode = () => {
      isAutoMode.value = !isAutoMode.value;
      
      // Show a small toast notification
      const toastMessage = isAutoMode.value 
        ? 'Auto detection enabled' 
        : 'Manual mode: Select a note to tune';
        
      Swal.fire({
        toast: true,
        position: 'bottom',
        icon: isAutoMode.value ? 'info' : 'success',
        title: toastMessage,
        showConfirmButton: false,
        timer: 2000
      });
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // Ensure the component state is in sync with the document
      const isDarkFromDOM = document.documentElement.classList.contains('dark')
      if (isDarkMode.value !== isDarkFromDOM) {
        isDarkMode.value = isDarkFromDOM
      }
      
      Swal.fire('Welcome to Vue Tuner!').then(() => {
        initTuner()
      })
      
      // Get references to DOM elements
      frequencyBarsEl.value = document.querySelector('.frequency-bars')
    })
    
    onUnmounted(() => {
      // Clean up
      if (tuner.value) {
        tuner.value.close()
      }
    })
    
    return {
      a4,
      notesList,
      currentNote,
      currentFrequency,
      isAutoMode,
      meterRotation,
      frequencyBars: frequencyBarsEl,
      selectNote,
      changeA4,
      isDarkMode,
      toggleTheme,
      commonNotes,
      safeCommonNotes,
      meterAccuracy,
      toggleAutoMode
    }
  }
}
</script> 