<script lang="ts">
  import { navigating } from '$app/stores';

  $: visibility = $navigating !== null ? 'visible' : 'hidden';
</script>

<div class="loading-bar" style:visibility>
  <div class="loading-bar-value" />
</div>

<style>
  .loading-bar {
    position: sticky;
    top: 0;
    left: 0;
    height: 4px;
    background-color: rgba(5, 114, 206, 0.2);
    width: 100%;
    overflow: hidden;
  }

  .loading-bar-value {
    width: 100%;
    height: 100%;
    background-color: rgb(5, 114, 206);
    animation: indeterminateAnimation 1s infinite linear;
    transform-origin: 0% 50%;
  }

  @keyframes indeterminateAnimation {
    0% {
      transform: translateX(0) scaleX(0);
    }
    40% {
      transform: translateX(0) scaleX(0.4);
    }
    100% {
      transform: translateX(100%) scaleX(0.5);
    }
  }
</style>
