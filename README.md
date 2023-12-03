# evo-utils

`evo-utils` is a comprehensive utility module designed for TypeScript/JavaScript projects. It encapsulates a collection of common utility classes that can streamline and enhance your development process. Whether you're dealing with data management, task sequencing, or trying to handle requests efficiently, `evo-utils` has got you covered.

## Features

- **Cache Classes**: Efficiently cache data, ensuring quick access and improved performance. Helps reduce redundant operations and fetches.
  
- **Deque**: Manage and organize tasks or data in a FIFO (First-In, First-Out) manner. Ideal for sequencing tasks, managing data streams, and more.
  
- **RateLimiter**: Ensure your functions or requests don't exceed a specified limit. Essential for avoiding overloading servers or hitting third-party API limits. This interface has 2 different implementations: TimeBasedLimiter and 
DecayLimiter which use different algorithms to calculate the rate.

## Getting Started

1. Install `evo-utils`:
   ```sh
   npm install evo-utils --save
   ```

2. Import and utilize the utility classes as needed:

    ```typescript
    import { Cache, LRUCache, DecayCache, Dequeue, RateLimiter, TimeBasedLimiter, DecayLimiter } from 'evo-utils';
    ```
3. Examples & Usage
For detailed examples and usage, please refer to the respective sections for each utility.

4. Contribution
Feel free to contribute to evo-utils! We appreciate any feedback, improvements, or added functionalities.

5. License
[MIT](./LICENSE)

Enjoy streamlined development with evo-utils!