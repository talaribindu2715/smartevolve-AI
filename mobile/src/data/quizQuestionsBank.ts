// mobile/src/data/quizQuestionsBank.ts
// Autonomous High-Capacity Master Quiz Question Bank (368+ Questions & Dynamic Synthesis)

export interface ArenaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUESTION_BANK: Record<string, ArenaQuestion[]> = {
  "python": [
    {
      "id": 1,
      "question": "What is the output of `[x**2 for x in range(4) if x % 2 == 0]` in Python?",
      "options": [
        "[0, 4]",
        "[0, 1, 4, 9]",
        "[4, 16]",
        "[0, 2]"
      ],
      "correctIndex": 0,
      "explanation": "The range is 0, 1, 2, 3. Even numbers are 0 and 2. Squaring them yields [0, 4]."
    },
    {
      "id": 2,
      "question": "Which Python data structure is immutable and defined with parentheses?",
      "options": [
        "Tuple",
        "List",
        "Dictionary",
        "Set"
      ],
      "correctIndex": 0,
      "explanation": "Tuples are immutable sequence types in Python."
    },
    {
      "id": 3,
      "question": "Which library is the standard foundation for high-performance multidimensional array math in Python?",
      "options": [
        "NumPy",
        "Requests",
        "Flask",
        "BeautifulSoup"
      ],
      "correctIndex": 0,
      "explanation": "NumPy provides ndarray objects and vector math routines."
    },
    {
      "id": 4,
      "question": "In Python, which keyword is used to create an anonymous single-expression function?",
      "options": [
        "lambda",
        "def",
        "inline",
        "anon"
      ],
      "correctIndex": 0,
      "explanation": "The lambda keyword defines anonymous single-expression functions."
    },
    {
      "id": 5,
      "question": "What does the GIL (Global Interpreter Lock) enforce in CPython?",
      "options": [
        "Only one native thread executes Python bytecode at any instant",
        "Encrypts memory variables",
        "Auto terminates deadlocked processes",
        "Strict compile-time type checks"
      ],
      "correctIndex": 0,
      "explanation": "The GIL prevents multiple native threads from executing Python bytecodes simultaneously in CPython."
    },
    {
      "id": 6,
      "question": "Which keyword transforms a standard function into a memory-efficient generator iterator?",
      "options": [
        "yield",
        "return",
        "generate",
        "iter"
      ],
      "correctIndex": 0,
      "explanation": "The yield statement suspends function execution and yields intermediate values lazily."
    },
    {
      "id": 7,
      "question": "What is the average time complexity of key lookup in a Python dictionary?",
      "options": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n^2)"
      ],
      "correctIndex": 0,
      "explanation": "Dictionaries use hash tables with O(1) average lookup."
    },
    {
      "id": 8,
      "question": "Which dunder method must be implemented to support the `with` context manager in Python?",
      "options": [
        "__enter__ and __exit__",
        "__init__",
        "__call__",
        "__open__"
      ],
      "correctIndex": 0,
      "explanation": "Context managers require __enter__ and __exit__."
    },
    {
      "id": 9,
      "question": "Which operator allows passing a variable number of keyword arguments to a Python function?",
      "options": [
        "**kwargs",
        "*args",
        "kwargs[]",
        "&kwargs"
      ],
      "correctIndex": 0,
      "explanation": "**kwargs unpacks keyword dictionary arguments."
    },
    {
      "id": 10,
      "question": "Which built-in Python module provides the `@lru_cache` decorator for memoization?",
      "options": [
        "functools",
        "itertools",
        "collections",
        "operator"
      ],
      "correctIndex": 0,
      "explanation": "functools provides @lru_cache."
    },
    {
      "id": 11,
      "question": "Which decorator is used in Python to define a getter method on a class?",
      "options": [
        "@property",
        "@getter",
        "@readonly",
        "@staticmethod"
      ],
      "correctIndex": 0,
      "explanation": "@property creates managed getter attributes."
    },
    {
      "id": 12,
      "question": "Which module provides true CPU-bound parallelism in Python bypassing the GIL?",
      "options": [
        "multiprocessing",
        "threading",
        "asyncio",
        "concurrent.threads"
      ],
      "correctIndex": 0,
      "explanation": "multiprocessing spawns distinct OS processes with independent memory spaces."
    },
    {
      "id": 13,
      "question": "What is the difference between `deepcopy` and `shallow copy` in Python?",
      "options": [
        "Deepcopy recursively duplicates all nested objects; shallow copy copies only outer references",
        "Shallow copy creates immutable objects",
        "Deepcopy runs in O(1)",
        "They are identical"
      ],
      "correctIndex": 0,
      "explanation": "Deepcopy recursively duplicates child objects."
    },
    {
      "id": 14,
      "question": "Which built-in function returns an iterator of tuples containing item index and value?",
      "options": [
        "enumerate()",
        "zip()",
        "map()",
        "range()"
      ],
      "correctIndex": 0,
      "explanation": "enumerate(iterable) yields (index, value)."
    },
    {
      "id": 15,
      "question": "In Python 3.10+, which syntax provides structural pattern matching?",
      "options": [
        "match ... case",
        "switch ... case",
        "when ... then",
        "select ... case"
      ],
      "correctIndex": 0,
      "explanation": "Python 3.10 introduced match ... case pattern matching."
    },
    {
      "id": 16,
      "question": "What is the result of `type(None)` in Python?",
      "options": [
        "<class 'NoneType'>",
        "<class 'null'>",
        "<class 'void'>",
        "<class 'undefined'>"
      ],
      "correctIndex": 0,
      "explanation": "None is a singleton of class NoneType."
    },
    {
      "id": 17,
      "question": "Which built-in collection type maintains insertion order and unique elements?",
      "options": [
        "dict in Python 3.7+ (keys)",
        "set",
        "frozenset",
        "collections.defaultdict only"
      ],
      "correctIndex": 0,
      "explanation": "Standard Python dictionaries guarantee insertion order preservation since 3.7."
    },
    {
      "id": 18,
      "question": "What is the time complexity of appending an item to the end of a Python `list`?",
      "options": [
        "Amortized O(1)",
        "O(n)",
        "O(log n)",
        "O(n^2)"
      ],
      "correctIndex": 0,
      "explanation": "Lists are dynamic arrays with amortized O(1) append."
    },
    {
      "id": 19,
      "question": "Which method is used in Python to remove and return an element by key from a dictionary?",
      "options": [
        "pop()",
        "remove()",
        "discard()",
        "extract()"
      ],
      "correctIndex": 0,
      "explanation": "dict.pop(key[, default]) removes and returns the value."
    },
    {
      "id": 20,
      "question": "What does the `is` operator compare in Python?",
      "options": [
        "Memory identity / object references",
        "Value equality",
        "Data types only",
        "String lengths"
      ],
      "correctIndex": 0,
      "explanation": "`is` evaluates whether two identifiers refer to the exact same memory address (id)."
    },
    {
      "id": 21,
      "question": "What is the purpose of `__slots__` in a Python class definition?",
      "options": [
        "Restricts attribute creation to save memory and eliminate per-instance __dict__",
        "Enforces static types",
        "Encrypts class attributes",
        "Enables thread-safety"
      ],
      "correctIndex": 0,
      "explanation": "__slots__ prevents dynamic __dict__ creation, reducing per-instance RAM usage."
    },
    {
      "id": 22,
      "question": "Which standard library module is used for asynchronous I/O and coroutines in Python?",
      "options": [
        "asyncio",
        "concurrent",
        "twisted",
        "multitask"
      ],
      "correctIndex": 0,
      "explanation": "asyncio provides event loop, tasks, and async/await syntax."
    },
    {
      "id": 23,
      "question": "What does `*args` unpack in a Python function parameter list?",
      "options": [
        "Positional arguments as a tuple",
        "Keyword arguments as a dict",
        "Global variables",
        "Pointers"
      ],
      "correctIndex": 0,
      "explanation": "*args collects variable positional arguments into a tuple."
    },
    {
      "id": 24,
      "question": "In Python, which built-in function converts an iterable of pairs into a dictionary?",
      "options": [
        "dict()",
        "map()",
        "zip()",
        "parse_dict()"
      ],
      "correctIndex": 0,
      "explanation": "dict([('a', 1), ('b', 2)]) builds {'a': 1, 'b': 2}."
    },
    {
      "id": 25,
      "question": "What is the time complexity of checking `x in s` if `s` is a `set`?",
      "options": [
        "Average O(1)",
        "O(n)",
        "O(log n)",
        "O(n log n)"
      ],
      "correctIndex": 0,
      "explanation": "Sets use hash tables offering average O(1) membership lookup."
    },
    {
      "id": 26,
      "question": "Which keyword is used to raise a custom exception in Python?",
      "options": [
        "raise",
        "throw",
        "panic",
        "error"
      ],
      "correctIndex": 0,
      "explanation": "Python uses `raise ExceptionName('message')` to trigger exceptions."
    },
    {
      "id": 27,
      "question": "What does `[:: -1]` do when applied to a string or list?",
      "options": [
        "Reverses the sequence",
        "Doubles each element",
        "Returns odd elements only",
        "Throws a slice syntax error"
      ],
      "correctIndex": 0,
      "explanation": "A slice step of -1 traverses the sequence backwards, reversing it."
    },
    {
      "id": 28,
      "question": "Which method splits a string into a list using a specified delimiter?",
      "options": [
        "split()",
        "tokenize()",
        "slice()",
        "separate()"
      ],
      "correctIndex": 0,
      "explanation": "str.split(sep) returns substrings separated by sep."
    },
    {
      "id": 29,
      "question": "What will `bool([])` evaluate to in Python?",
      "options": [
        "False",
        "True",
        "None",
        "IndexError"
      ],
      "correctIndex": 0,
      "explanation": "Empty collections (lists, tuples, dicts, sets, strings) evaluate to False."
    },
    {
      "id": 30,
      "question": "Which module provides fast mathematical operations for random numbers and distributions?",
      "options": [
        "random",
        "math",
        "os",
        "sys"
      ],
      "correctIndex": 0,
      "explanation": "The `random` module provides pseudo-random number generators."
    },
    {
      "id": 31,
      "question": "What is the purpose of the `dataclass` decorator in Python?",
      "options": [
        "Automatically generates __init__, __repr__, and __eq__ boilerplate methods",
        "Enforces immutable GPU execution",
        "Compiles class into C++ bytecode",
        "Creates database tables"
      ],
      "correctIndex": 0,
      "explanation": "@dataclass automatically generates standard special methods."
    },
    {
      "id": 32,
      "question": "Which function is used to find the length of any collection or sequence in Python?",
      "options": [
        "len()",
        "size()",
        "count()",
        "length()"
      ],
      "correctIndex": 0,
      "explanation": "len(obj) calls obj.__len__() to return element count."
    },
    {
      "id": 33,
      "question": "What is the difference between `list.sort()` and `sorted(list)`?",
      "options": [
        "list.sort() sorts in-place returning None; sorted() returns a new sorted list",
        "sorted() mutates the original list",
        "list.sort() only works on numbers",
        "There is no difference"
      ],
      "correctIndex": 0,
      "explanation": "list.sort() modifies the list in place; sorted() returns a newly allocated list."
    },
    {
      "id": 34,
      "question": "How do you open a file for writing in binary mode in Python?",
      "options": [
        "open('filename', 'wb')",
        "open('filename', 'w+')",
        "open('filename', 'rb')",
        "open('filename', 'binary')"
      ],
      "correctIndex": 0,
      "explanation": "Mode 'wb' specifies write and binary mode."
    },
    {
      "id": 35,
      "question": "What does the `pass` statement do in Python?",
      "options": [
        "Acts as a syntactical no-op null statement placeholder",
        "Skips to the next loop iteration",
        "Breaks out of functions",
        "Terminates the thread"
      ],
      "correctIndex": 0,
      "explanation": "`pass` executes nothing and serves as a syntactic placeholder."
    },
    {
      "id": 36,
      "question": "What is the primary motivation behind PEP 703 (making the Global Interpreter Lock optional in Python 3.13)?",
      "options": [
        "To enable true multi-threaded CPU-bound parallelism utilizing all processor cores without separate processes",
        "To remove type annotations from the Python language",
        "To replace Python bytecode with WebAssembly",
        "To enforce strict compilation before running Python scripts"
      ],
      "correctIndex": 0,
      "explanation": "Free-threaded CPython (PEP 703) removes the GIL, allowing threads in the same process to execute Python bytecode concurrently across multiple CPU cores."
    },
    {
      "id": 37,
      "question": "In Python, what is the key memory advantage of using `__slots__` in a class definition with millions of instances?",
      "options": [
        "Prevents creation of the default per-instance `__dict__`, significantly reducing RAM footprint per object",
        "Encrypts object attributes in memory",
        "Automatically serializes objects to Redis",
        "Enables multi-threading on single-core systems"
      ],
      "correctIndex": 0,
      "explanation": "__slots__ tells Python not to create a dynamic __dict__ for each instance, saving significant memory when creating millions of small objects."
    },
    {
      "id": 38,
      "question": "How does `functools.lru_cache` improve performance in Python applications?",
      "options": [
        "Memoizes function call results based on positional and keyword arguments, returning cached outputs for identical inputs",
        "Compresses Python source files on disk",
        "Increases the recursion limit of the Python interpreter to infinity",
        "Runs functions asynchronously in the background"
      ],
      "correctIndex": 0,
      "explanation": "lru_cache wraps a function with a Least Recently Used memoization dictionary, avoiding redundant expensive computations for identical parameters."
    },
    {
      "id": 39,
      "question": "In Python's context manager protocol, what do the `__enter__` and `__exit__` methods ensure?",
      "options": [
        "Guaranteed resource acquisition and cleanup (e.g. closing files or releasing locks) even if unhandled exceptions occur",
        "Compiles Python code into machine language upon entering functions",
        "Encrypts function arguments",
        "Automatically restarts crashed Python processes"
      ],
      "correctIndex": 0,
      "explanation": "Context managers with the 'with' statement guarantee that __exit__ is invoked to cleanup resources even when exceptions are raised."
    },
    {
      "id": 40,
      "question": "What is the difference between `asyncio.gather()` and `asyncio.wait()` in Python asynchronous programming?",
      "options": [
        "`gather()` returns results in the order passed and treats tasks as a group; `wait()` provides fine-grained control over individual task completion states (FIRST_COMPLETED, ALL_COMPLETED)",
        "`gather()` only works with HTTP requests",
        "`wait()` is synchronous and blocks the entire OS thread",
        "`gather()` is deprecated in Python 3.12"
      ],
      "correctIndex": 0,
      "explanation": "asyncio.gather aggregates results into an ordered list, while asyncio.wait returns done/pending sets with configurable return conditions."
    },
    {
      "id": 41,
      "question": "What is the Python Walrus operator `:=` and what does it do?",
      "options": [
        "Assignment expression: assigns values to variables as part of a larger expression (e.g. inside while loops or if conditions)",
        "Deep copies an object in memory",
        "Performs matrix multiplication between tensors",
        "Declares a constant immutable variable"
      ],
      "correctIndex": 0,
      "explanation": "Introduced in Python 3.8 (PEP 572), := assigns and evaluates an expression simultaneously in one step."
    },
    {
      "id": 42,
      "question": "How does Python handle memory management for objects with circular references?",
      "options": [
        "CPython combines reference counting with a generational cyclic garbage collector that periodically detects and cleans up unreachable reference loops",
        "Circular references always cause permanent memory leaks that cannot be freed",
        "CPython converts circular references to weak references automatically",
        "Circular references throw a compile-time SyntaxError"
      ],
      "correctIndex": 0,
      "explanation": "While reference counting handles immediate deallocation, CPython's generational cyclic GC periodically traverses object graphs to free cyclic references."
    },
    {
      "id": 43,
      "question": "What is the difference between `copy.copy()` (shallow copy) and `copy.deepcopy()` in Python?",
      "options": [
        "Shallow copy copies the outer container while preserving references to nested objects; deep copy recursively copies all nested objects into new memory",
        "Shallow copy modifies the original object in place",
        "Deep copy only works on numerical arrays",
        "Shallow copy converts all strings to uppercase"
      ],
      "correctIndex": 0,
      "explanation": "A shallow copy constructs a new compound object and inserts references to the original nested elements; deep copy duplicates everything recursively."
    },
    {
      "id": 44,
      "question": "In Python, why is NumPy array vectorization dramatically faster than standard Python `for` loops?",
      "options": [
        "NumPy executes contiguous memory operations in optimized C/Fortran libraries with CPU SIMD vector registers, bypassing Python bytecode overhead",
        "NumPy uses quantum computing processors",
        "NumPy runs code inside the browser's JavaScript V8 engine",
        "NumPy converts all data into 64-bit integer strings"
      ],
      "correctIndex": 0,
      "explanation": "Vectorized operations run in compiled C with contiguous C-arrays and SIMD vector instructions, eliminating Python per-iteration interpreter overhead."
    },
    {
      "id": 45,
      "question": "In FastAPI, what does the `Depends()` function implement?",
      "options": [
        "Dependency Injection: declares shared logic, security/auth checks, and database session lifecycles across route handlers",
        "Imports external npm packages dynamically",
        "Restarts the Uvicorn web server when files change",
        "Encrypts request cookies using AES-256"
      ],
      "correctIndex": 0,
      "explanation": "FastAPI's Depends system enables clean, hierarchical dependency injection for authentication, database sessions, and parameter parsing."
    },
    {
      "id": 46,
      "question": "What is the time complexity of appending an element to a Python `list`?",
      "options": [
        "Amortized $O(1)$ constant time",
        "$O(N)$ linear time",
        "$O(\\log N)$ logarithmic time",
        "$O(N^2)$ quadratic time"
      ],
      "correctIndex": 0,
      "explanation": "Python lists are dynamic arrays: appending is O(1) amortized, occasionally resizing when capacity is exceeded."
    },
    {
      "id": 47,
      "question": "In Python, how does `itertools.chain(*iterables)` handle memory when combining large collections?",
      "options": [
        "Yields elements one by one lazily without creating a combined in-memory list",
        "Loads all items into RAM before starting",
        "Writes elements to a temporary disk file",
        "Compresses items with zlib"
      ],
      "correctIndex": 0,
      "explanation": "itertools.chain evaluates lazily, achieving O(1) memory footprint regardless of collection size."
    },
    {
      "id": 48,
      "question": "What does the `pydantic` library provide in modern Python backend applications (such as FastAPI)?",
      "options": [
        "Data validation, settings management, and automated parsing using standard Python type annotations",
        "A fast SQL database engine",
        "A CSS styling preprocessor",
        "A network packet analyzer"
      ],
      "correctIndex": 0,
      "explanation": "Pydantic enforces type hints at runtime and provides user-friendly error handling and serialization."
    },
    {
      "id": 49,
      "question": "In Python, what is the output of `type(type)`?",
      "options": [
        "`<class 'type'>` (type is an instance of itself)",
        "`<class 'object'>`",
        "`<class 'NoneType'>`",
        "`SyntaxError`"
      ],
      "correctIndex": 0,
      "explanation": "In Python, 'type' is the default metaclass and is an instance of itself."
    },
    {
      "id": 50,
      "question": "What is a Python generator expression syntax and how does it differ from a list comprehension?",
      "options": [
        "` (x for x in data) ` uses parentheses and returns a lazy iterator; ` [x for x in data] ` allocates a full list in RAM",
        "Generators are written with curly braces `{}`",
        "List comprehensions run in separate threads",
        "Generators cannot be iterated over"
      ],
      "correctIndex": 0,
      "explanation": "Generator expressions use parentheses to generate items on-demand, saving memory on large sequences."
    }
  ],
  "machinelearning": [
    {
      "id": 1,
      "question": "In supervised learning, what primary information is provided alongside input training features?",
      "options": [
        "Ground-truth Target Labels",
        "Unlabeled Clusters",
        "Network Bandwidth",
        "Random Eigenvectors"
      ],
      "correctIndex": 0,
      "explanation": "Supervised learning requires labeled targets to calculate loss and update weights."
    },
    {
      "id": 2,
      "question": "Which loss function is standard for training binary classification models with logistic outputs?",
      "options": [
        "Binary Cross-Entropy (Log Loss)",
        "Mean Squared Error",
        "Hinge Loss",
        "Huber Loss"
      ],
      "correctIndex": 0,
      "explanation": "Binary Cross-Entropy penalizes confident wrong predictions asymptotically."
    },
    {
      "id": 3,
      "question": "What algorithm calculates gradients across deep neural network layers using the chain rule?",
      "options": [
        "Backpropagation",
        "Forward Chaining",
        "Simulated Annealing",
        "Markov Decision Process"
      ],
      "correctIndex": 0,
      "explanation": "Backpropagation propagates errors backwards through layers using partial derivatives."
    },
    {
      "id": 4,
      "question": "A model with near-zero training error but high validation/test error is suffering from what condition?",
      "options": [
        "Overfitting (High Variance)",
        "Underfitting (High Bias)",
        "Gradient Explosion",
        "Mode Collapse"
      ],
      "correctIndex": 0,
      "explanation": "Overfitting occurs when a model memorizes training noise rather than generalizable signals."
    },
    {
      "id": 5,
      "question": "In the Transformer architecture (Vaswani et al.), what mechanism allows tokens to attend to all positions?",
      "options": [
        "Multi-Head Self-Attention",
        "Recurrent Feedback",
        "Convolutional Max-Pooling",
        "Layer Normalization"
      ],
      "correctIndex": 0,
      "explanation": "Self-attention computes dynamic attention weights between all token pairs."
    },
    {
      "id": 6,
      "question": "Which hyperparameter determines the step size taken along the negative gradient during optimization?",
      "options": [
        "Learning Rate (alpha)",
        "Batch Size",
        "Epoch Count",
        "Regularization Lambda"
      ],
      "correctIndex": 0,
      "explanation": "Learning rate scales gradient updates to weight parameters."
    },
    {
      "id": 7,
      "question": "Which ensemble learning technique trains multiple decision trees in parallel with bagging and random feature splits?",
      "options": [
        "Random Forest",
        "Gradient Boosting Machine",
        "AdaBoost",
        "Linear Discriminant Analysis"
      ],
      "correctIndex": 0,
      "explanation": "Random Forest builds parallel decorrelated decision trees using bootstrap aggregation."
    },
    {
      "id": 8,
      "question": "What evaluation metric represents the harmonic mean of Precision and Recall?",
      "options": [
        "F1-Score",
        "ROC-AUC",
        "Accuracy",
        "Mean Absolute Error"
      ],
      "correctIndex": 0,
      "explanation": "F1-Score balances false positives and false negatives."
    },
    {
      "id": 9,
      "question": "Which validation strategy splits data into k equal folds to iteratively train on k-1 and test on 1?",
      "options": [
        "K-Fold Cross-Validation",
        "Monte Carlo Sampling",
        "Leave-One-Out",
        "Bootstrapping"
      ],
      "correctIndex": 0,
      "explanation": "K-Fold cross-validation ensures every data point is tested once out-of-sample."
    },
    {
      "id": 10,
      "question": "What does an ROC-AUC score of 0.5 indicate?",
      "options": [
        "Performance equivalent to random guessing",
        "Perfect classification ability",
        "Severe inverse correlation",
        "Zero false positives"
      ],
      "correctIndex": 0,
      "explanation": "AUC of 0.5 represents a diagonal chance line with no discriminative power."
    },
    {
      "id": 11,
      "question": "Which regularization technique adds the absolute sum of weights (L1 norm) to induce sparsity?",
      "options": [
        "Lasso Regularization (L1)",
        "Ridge Regularization (L2)",
        "ElasticNet",
        "Dropout"
      ],
      "correctIndex": 0,
      "explanation": "L1 Lasso drives non-essential coefficients strictly to zero for feature selection."
    },
    {
      "id": 12,
      "question": "In Convolutional Neural Networks (CNNs), what layer type downsamples feature maps to achieve spatial invariance?",
      "options": [
        "Pooling Layer (Max / Average)",
        "Dense Linear Layer",
        "Embedding Layer",
        "Softmax Layer"
      ],
      "correctIndex": 0,
      "explanation": "Pooling reduces spatial dimensions, parameter count, and computation."
    },
    {
      "id": 13,
      "question": "What activation function outputs values in the range (0, 1), making it ideal for Bernoulli probabilities?",
      "options": [
        "Sigmoid",
        "ReLU",
        "Tanh",
        "Leaky ReLU"
      ],
      "correctIndex": 0,
      "explanation": "Sigmoid squashes real values into probabilities between 0 and 1."
    },
    {
      "id": 14,
      "question": "What problem does the ReLU activation function solve compared to deep networks using Sigmoid?",
      "options": [
        "Vanishing Gradient Problem",
        "Overfitting",
        "Data Leakage",
        "Curse of Dimensionality"
      ],
      "correctIndex": 0,
      "explanation": "ReLU maintains constant unit gradient for positive activations, mitigating vanishing gradients."
    },
    {
      "id": 15,
      "question": "What optimizer adapts per-parameter learning rates using first and second moments of the gradients?",
      "options": [
        "Adam (Adaptive Moment Estimation)",
        "SGD (Stochastic Gradient Descent)",
        "Adagrad",
        "RMSProp only"
      ],
      "correctIndex": 0,
      "explanation": "Adam computes exponential moving averages of both gradients and squared gradients."
    },
    {
      "id": 16,
      "question": "Which dimensionality reduction technique finds orthogonal axes of maximal variance in feature space?",
      "options": [
        "PCA (Principal Component Analysis)",
        "t-SNE",
        "UMAP",
        "Linear Regression"
      ],
      "correctIndex": 0,
      "explanation": "PCA projects data onto principal components that maximize variance."
    },
    {
      "id": 17,
      "question": "In unsupervised clustering, which algorithm assigns points to the nearest centroid and recomputes means iteratively?",
      "options": [
        "K-Means Clustering",
        "DBSCAN",
        "Hierarchical Clustering",
        "Gaussian Mixture Models"
      ],
      "correctIndex": 0,
      "explanation": "K-Means alternates between cluster assignment and centroid recalculation."
    },
    {
      "id": 18,
      "question": "What is Data Leakage in machine learning?",
      "options": [
        "Information from the test/target set inadvertently contaminates the training set",
        "Corrupted hard drives during training",
        "Overheating GPUs",
        "Missing labels in the dataset"
      ],
      "correctIndex": 0,
      "explanation": "Data leakage causes overly optimistic offline metrics that fail on unseen production data."
    },
    {
      "id": 19,
      "question": "What NLP tokenization model is standard in modern transformers like BERT and GPT?",
      "options": [
        "Subword Tokenization (BPE / WordPiece)",
        "Character-only",
        "Whitespace-only",
        "N-gram hashing only"
      ],
      "correctIndex": 0,
      "explanation": "Byte-Pair Encoding (BPE) handles out-of-vocabulary words using subword frequencies."
    },
    {
      "id": 20,
      "question": "What technique prevents overfitting in deep neural networks by randomly zeroing activations during training?",
      "options": [
        "Dropout",
        "Batch Normalization",
        "Gradient Clipping",
        "Label Smoothing"
      ],
      "correctIndex": 0,
      "explanation": "Dropout temporarily removes random units and their incoming/outgoing connections during forward passes."
    },
    {
      "id": 21,
      "question": "What does BLEU score measure in natural language processing?",
      "options": [
        "Similarity between machine translation output and human reference translations",
        "Grammar complexity",
        "Perplexity of language model",
        "Tokenization speed"
      ],
      "correctIndex": 0,
      "explanation": "Bilingual Evaluation Understudy (BLEU) measures n-gram overlap against human references."
    },
    {
      "id": 22,
      "question": "What is the temperature parameter in LLM text generation?",
      "options": [
        "Controls the randomness of the softmax probability distribution over vocabulary",
        "Controls GPU temperature in Celsius",
        "Determines context window size",
        "Sets learning rate during inference"
      ],
      "correctIndex": 0,
      "explanation": "Higher temperature flattens logits for creative responses; lower temperature sharpens top probabilities."
    },
    {
      "id": 23,
      "question": "In gradient descent, what is a mini-batch?",
      "options": [
        "A small random subset of training examples used to compute gradient step",
        "The smallest layer in the network",
        "A compressed model checkpoint",
        "A single GPU thread"
      ],
      "correctIndex": 0,
      "explanation": "Mini-batch SGD strikes a balance between computational efficiency and gradient stability."
    },
    {
      "id": 24,
      "question": "What metric measures the spread of predictions around the mean in regression problems?",
      "options": [
        "Mean Squared Error (MSE)",
        "Precision",
        "Recall",
        "Accuracy"
      ],
      "correctIndex": 0,
      "explanation": "MSE penalizes larger errors quadratically in continuous target predictions."
    },
    {
      "id": 25,
      "question": "Which matrix displays True Positives, False Positives, True Negatives, and False Negatives?",
      "options": [
        "Confusion Matrix",
        "Hessian Matrix",
        "Covariance Matrix",
        "Adjacency Matrix"
      ],
      "correctIndex": 0,
      "explanation": "Confusion matrices comprehensively detail binary or multiclass classification performance."
    },
    {
      "id": 26,
      "question": "What is transfer learning?",
      "options": [
        "Fine-tuning a model pre-trained on massive datasets for a specific downstream task",
        "Transferring model weights between two different GPUs",
        "Converting Python models into C++",
        "Translating code between languages"
      ],
      "correctIndex": 0,
      "explanation": "Transfer learning adapts pre-trained foundation weights to domain-specific datasets."
    },
    {
      "id": 27,
      "question": "In reinforcement learning, what function predicts expected cumulative future discounted rewards from a state?",
      "options": [
        "Value Function / Q-Function",
        "Loss Function",
        "Activation Function",
        "Confusion Function"
      ],
      "correctIndex": 0,
      "explanation": "Q-values estimate total expected discounted reward of taking an action in a given state."
    },
    {
      "id": 28,
      "question": "What does the bias-variance tradeoff describe?",
      "options": [
        "Balancing underfitting (high bias) against overfitting (high variance) to minimize test error",
        "Balancing model cost and training speed",
        "Balancing CPU and GPU usage",
        "Balancing precision and recall only"
      ],
      "correctIndex": 0,
      "explanation": "Total generalization error is decomposed into bias squared, variance, and irreducible noise."
    },
    {
      "id": 29,
      "question": "Which technique scales numerical features so that their mean is 0 and standard deviation is 1?",
      "options": [
        "StandardScaler (Z-score normalization)",
        "MinMaxScaler",
        "RobustScaler",
        "Normalizer"
      ],
      "correctIndex": 0,
      "explanation": "StandardScaler subtracts feature mean and divides by variance."
    },
    {
      "id": 30,
      "question": "What is prompt engineering in Generative AI?",
      "options": [
        "Crafting optimal input prompts and context to guide LLMs toward accurate desired outputs",
        "Writing Python compiler passes",
        "Tuning GPU clock speeds",
        "Engineering hardware server racks"
      ],
      "correctIndex": 0,
      "explanation": "Prompt engineering structures instructions, examples, and constraints for LLM inference."
    },
    {
      "id": 31,
      "question": "In the Transformer Multi-Head Self-Attention mechanism, why is the dot product scaled by $\\frac{1}{\\sqrt{d_k}}$?",
      "options": [
        "To prevent the dot products from growing excessively large for large dimensions, which would push softmax into regions with extremely small gradients",
        "To normalize vector magnitudes to Euclidean unit length",
        "To reduce the number of matrix multiplications on the GPU",
        "To ensure the model output is always positive"
      ],
      "correctIndex": 0,
      "explanation": "For large dimensions dk, dot products grow large in magnitude, pushing softmax into flat regions with vanishing gradients. Dividing by sqrt(dk) stabilizes gradients."
    },
    {
      "id": 32,
      "question": "What is the role of Rotary Position Embedding (RoPE) in modern LLMs like Llama 3 and Mistral?",
      "options": [
        "Encodes relative token positions by rotating query and key vector pairs in complex vector space rather than adding absolute position embeddings",
        "Compresses transformer weights to 1-bit precision",
        "Calculates cross-entropy loss during backpropagation",
        "Splits tokens into sub-character byte pairs"
      ],
      "correctIndex": 0,
      "explanation": "RoPE applies a rotation matrix to query and key vectors, allowing the dot product to naturally decay with relative token distance."
    },
    {
      "id": 33,
      "question": "What is the primary benefit of the KV Cache (Key-Value Cache) during autoregressive LLM text generation?",
      "options": [
        "Avoids recomputing Key and Value projection matrices for previously generated tokens at each generation step, accelerating token generation from $O(N^2)$ to $O(N)$",
        "Reduces LLM temperature to absolute zero",
        "Caches final HTTP responses in a Redis cluster",
        "Translates Python code to CUDA C++"
      ],
      "correctIndex": 0,
      "explanation": "Because past keys and values do not change when predicting the next token, caching them saves redundant transformer layer matrix multiplications."
    },
    {
      "id": 34,
      "question": "How does FlashAttention achieve a 2x-4x speedup in transformer training and inference without altering numerical outputs?",
      "options": [
        "Tiles attention computation into GPU on-chip SRAM blocks to drastically reduce slow read/write transfers to high-bandwidth GPU HBM memory",
        "Prunes 50% of the attention heads permanently",
        "Rounds all floating-point numbers to integers",
        "Bypasses the softmax activation entirely"
      ],
      "correctIndex": 0,
      "explanation": "FlashAttention is an exact attention algorithm that restructures attention computation into SRAM tiles, minimizing GPU memory bus traffic."
    },
    {
      "id": 35,
      "question": "In Low-Rank Adaptation (LoRA) parameter-efficient fine-tuning (PEFT), how are model weights updated?",
      "options": [
        "Freezes the pre-trained weights $W_0$ and injects trainable rank-decomposition matrices $A$ and $B$ such that $\\Delta W = B \\cdot A$ with rank $r \\ll d$",
        "Deletes 90% of model layers to run on mobile phones",
        "Fine-tunes only the final output tokenizer dictionary",
        "Retrains the entire model from scratch using randomized weights"
      ],
      "correctIndex": 0,
      "explanation": "LoRA freezes original weights and trains small low-rank matrices A and B (rank r typically 8 or 16), reducing trainable parameters by 99%."
    },
    {
      "id": 36,
      "question": "What is the difference between Temperature and Top-P (Nucleus) sampling in LLM text generation?",
      "options": [
        "Temperature flattens or sharpens the entire probability distribution; Top-P dynamically truncates the candidate pool to the smallest set whose cumulative probability reaches $P$",
        "Temperature controls output length; Top-P controls token speed",
        "Temperature is only used during training; Top-P is used during fine-tuning",
        "Both parameters perform identical mathematical operations"
      ],
      "correctIndex": 0,
      "explanation": "Temperature divides logits before softmax (higher = more diverse). Top-P dynamically chooses from only the most likely tokens whose combined probability is >= P."
    },
    {
      "id": 37,
      "question": "Why is Layer Normalization preferred over Batch Normalization in Transformer architectures?",
      "options": [
        "LayerNorm normalizes across the feature dimension for each token independently, working reliably across variable sequence lengths and batch size 1",
        "BatchNorm requires specialized quantum hardware",
        "LayerNorm eliminates the need for activation functions",
        "BatchNorm cannot be implemented in PyTorch"
      ],
      "correctIndex": 0,
      "explanation": "Batch Normalization depends on batch statistics across samples, which is problematic for variable sequence lengths and small batch sizes in NLP."
    },
    {
      "id": 38,
      "question": "In classification models, why is Recall prioritized over Precision when building AI medical diagnosis systems?",
      "options": [
        "Because missing a true positive condition (False Negative) has life-threatening consequences, whereas False Positives can be ruled out by follow-up tests",
        "Because Recall is always computationally cheaper to calculate",
        "Because Precision cannot be computed for binary outcomes",
        "Because high Recall guarantees zero False Positives"
      ],
      "correctIndex": 0,
      "explanation": "Recall = TP / (TP + FN). In critical diagnostics, minimizing False Negatives (missed diagnoses) is prioritized over avoiding False Positives."
    },
    {
      "id": 39,
      "question": "What is the primary difference between DPO (Direct Preference Optimization) and traditional RLHF in LLM alignment?",
      "options": [
        "DPO optimizes the language model directly on human preference pairs using an exact closed-form loss, eliminating the need to train a separate reward model and run PPO",
        "DPO requires 10x more GPU clusters than RLHF",
        "RLHF does not use human preference data",
        "DPO only works on computer vision models"
      ],
      "correctIndex": 0,
      "explanation": "DPO implicitly defines the reward function via the language model itself, mathematically simplifying preference alignment and stabilizing training."
    },
    {
      "id": 40,
      "question": "In Retrieval-Augmented Generation (RAG), what is the function of a Cross-Encoder Reranker?",
      "options": [
        "Performs deep joint attention between the query and candidate documents to accurately reorder the top retrieved chunks before LLM synthesis",
        "Converts PDF documents into markdown text",
        "Compresses vector embeddings into 8-bit integers",
        "Generates synthetic user questions"
      ],
      "correctIndex": 0,
      "explanation": "While Bi-Encoders allow fast vector search, Cross-Encoders attend over the query and text jointly, yielding much higher precision reranking of retrieved passages."
    },
    {
      "id": 41,
      "question": "What is the primary difference between L1 regularization (Lasso) and L2 regularization (Ridge)?",
      "options": [
        "L1 penalizes absolute weights driving coefficients to exact zero (feature selection); L2 penalizes squared weights shrinking them smoothly",
        "L1 only works on neural networks",
        "L2 causes underfitting exclusively",
        "Both methods yield identical weight distributions"
      ],
      "correctIndex": 0,
      "explanation": "L1 (Lasso) produces sparse models by zeroing out non-informative features; L2 (Ridge) prevents weights from becoming too large."
    },
    {
      "id": 42,
      "question": "In LLM prompt engineering, what is 'Few-Shot Prompting'?",
      "options": [
        "Providing the model with a few input-output demonstrations before asking it to complete the target task",
        "Fine-tuning the model with 5 epochs",
        "Limiting output to 5 words",
        "Training on 5 GPU clusters"
      ],
      "correctIndex": 0,
      "explanation": "Few-shot prompting provides contextual in-context learning examples directly within the prompt to guide output format."
    },
    {
      "id": 43,
      "question": "What does AUC-ROC (Area Under the Receiver Operating Characteristic Curve) measure?",
      "options": [
        "A binary classifier's ability to distinguish between positive and negative classes across all possible decision thresholds",
        "The training speed of a GPU cluster",
        "The memory size of model weights in gigabytes",
        "The number of tokens generated per second"
      ],
      "correctIndex": 0,
      "explanation": "AUC measures class separability: an AUC of 1.0 represents a perfect classifier; 0.5 represents random guessing."
    },
    {
      "id": 44,
      "question": "What is Catastrophic Forgetting in Artificial Neural Networks?",
      "options": [
        "When a model trained on a new task experiences an abrupt drop in performance on previously learned tasks",
        "When a model runs out of GPU memory",
        "When a dataset is deleted from disk",
        "When weights are initialized to zero"
      ],
      "correctIndex": 0,
      "explanation": "Catastrophic forgetting occurs when updates for a new task overwrite the weight representations established for prior tasks."
    },
    {
      "id": 45,
      "question": "In Deep Learning, what is the purpose of Gradient Clipping during backpropagation?",
      "options": [
        "Clamps gradients to a maximum threshold value to prevent exploding gradients from destabilizing weight updates",
        "Speeds up CPU clock frequencies",
        "Deletes redundant neural connections",
        "Converts floats to integers"
      ],
      "correctIndex": 0,
      "explanation": "Gradient clipping caps gradient norms to a maximum value, preventing catastrophic divergence in RNNs and Transformers."
    }
  ],
  "springboot": [
    {
      "id": 1,
      "question": "Which annotation marks a Spring Boot class as a RESTful controller combining @Controller and @ResponseBody?",
      "options": [
        "@RestController",
        "@Service",
        "@Repository",
        "@Component"
      ],
      "correctIndex": 0,
      "explanation": "@RestController serializes return objects directly into HTTP response bodies."
    },
    {
      "id": 2,
      "question": "What Spring Data interface provides built-in pagination, sorting, and standard CRUD operations?",
      "options": [
        "JpaRepository",
        "JdbcTemplate",
        "CrudEngine",
        "SessionManager"
      ],
      "correctIndex": 0,
      "explanation": "JpaRepository extends PagingAndSortingRepository and CrudRepository."
    },
    {
      "id": 3,
      "question": "Where are application environment configurations primarily defined in standard Spring Boot projects?",
      "options": [
        "application.yml or application.properties",
        "pom.xml",
        "web.xml",
        "beans.xml"
      ],
      "correctIndex": 0,
      "explanation": "application.yml/properties in src/main/resources configures server port, datasources, and profiles."
    },
    {
      "id": 4,
      "question": "Which HTTP status code should a REST endpoint return when a new resource is successfully created?",
      "options": [
        "201 Created",
        "200 OK",
        "204 No Content",
        "202 Accepted"
      ],
      "correctIndex": 0,
      "explanation": "RFC 7231 specifies 201 Created for successful POST creation operations."
    },
    {
      "id": 5,
      "question": "Which annotation maps HTTP GET requests onto specific controller handler methods in Spring Boot?",
      "options": [
        "@GetMapping",
        "@PostMapping",
        "@PutMapping",
        "@DeleteMapping"
      ],
      "correctIndex": 0,
      "explanation": "@GetMapping is a composed annotation shortcut for @RequestMapping(method = RequestMethod.GET)."
    },
    {
      "id": 6,
      "question": "What is the default embedded servlet web container provided by spring-boot-starter-web?",
      "options": [
        "Apache Tomcat",
        "Eclipse Jetty",
        "Red Hat Undertow",
        "GlassFish"
      ],
      "correctIndex": 0,
      "explanation": "Spring Boot web starter embeds Apache Tomcat by default listening on port 8080."
    },
    {
      "id": 7,
      "question": "In Spring Boot Dependency Injection, which annotation marks a service class holding core business logic?",
      "options": [
        "@Service",
        "@Controller",
        "@Configuration",
        "@Aspect"
      ],
      "correctIndex": 0,
      "explanation": "@Service is a stereotype annotation for domain service components."
    },
    {
      "id": 8,
      "question": "Which annotation ensures database operations inside a method execute inside a single transaction with automatic rollback?",
      "options": [
        "@Transactional",
        "@Async",
        "@Modifying",
        "@Synchronized"
      ],
      "correctIndex": 0,
      "explanation": "@Transactional manages ACID database boundaries declaratively."
    },
    {
      "id": 9,
      "question": "What Spring Boot actuator endpoint provides real-time application health metrics and liveness probes?",
      "options": [
        "/actuator/health",
        "/actuator/info",
        "/actuator/metrics",
        "/actuator/beans"
      ],
      "correctIndex": 0,
      "explanation": "/actuator/health provides health check status used by container orchestrators."
    },
    {
      "id": 10,
      "question": "Which annotation in Spring Boot is used to inject custom properties defined in application.yml into a field?",
      "options": [
        "@Value",
        "@Autowired",
        "@Qualifier",
        "@Inject"
      ],
      "correctIndex": 0,
      "explanation": "@Value('${property.key}') resolves configuration values into bean fields."
    },
    {
      "id": 11,
      "question": "Which bean scope ensures only one instance of a bean is created per Spring ApplicationContext container?",
      "options": [
        "Singleton",
        "Prototype",
        "Request",
        "Session"
      ],
      "correctIndex": 0,
      "explanation": "Singleton is the default Spring bean scope."
    },
    {
      "id": 12,
      "question": "What tools does Spring Boot leverage for automated database version control and migration scripts?",
      "options": [
        "Flyway & Liquibase",
        "Hibernate DDL Auto only",
        "Docker Compose",
        "Webpack"
      ],
      "correctIndex": 0,
      "explanation": "Flyway and Liquibase execute SQL migration scripts (e.g. V1__init.sql) sequentially."
    },
    {
      "id": 13,
      "question": "In Spring Security, which filter component validates incoming JSON Web Tokens (JWT) before dispatching to controllers?",
      "options": [
        "OncePerRequestFilter",
        "DispatcherServlet",
        "HandlerInterceptor",
        "FilterRegistrationBean"
      ],
      "correctIndex": 0,
      "explanation": "OncePerRequestFilter guarantees single execution per HTTP request to validate bearer tokens."
    },
    {
      "id": 14,
      "question": "Which module enables asynchronous non-blocking event-driven reactive REST programming in Spring Boot?",
      "options": [
        "Spring WebFlux & Project Reactor",
        "Spring MVC",
        "Spring Batch",
        "Spring HATEOAS"
      ],
      "correctIndex": 0,
      "explanation": "Spring WebFlux uses Project Reactor (Mono & Flux) on a non-blocking Netty runtime."
    },
    {
      "id": 15,
      "question": "In Java, what is the key difference between `==` and `.equals()` when comparing two objects?",
      "options": [
        "`==` compares memory references; `.equals()` compares logical content",
        "`==` compares values; `.equals()` compares references",
        "They are identical in all cases",
        "`.equals()` is only for numbers"
      ],
      "correctIndex": 0,
      "explanation": "`==` tests reference identity; `.equals()` evaluates semantic equality."
    },
    {
      "id": 16,
      "question": "Which Java Collection interface represents an ordered sequence that allows duplicates and index-based access?",
      "options": [
        "List",
        "Set",
        "Map",
        "Queue"
      ],
      "correctIndex": 0,
      "explanation": "List preserves insertion order and enables element retrieval via numeric indexes."
    },
    {
      "id": 17,
      "question": "What does the `final` keyword indicate when applied to a Java class?",
      "options": [
        "The class cannot be extended / subclassed (inheritance prevented)",
        "All methods must be static",
        "The class is stored in heap only",
        "The class cannot have constructors"
      ],
      "correctIndex": 0,
      "explanation": "Declaring a class final prevents inheritance (e.g., java.lang.String is final)."
    },
    {
      "id": 18,
      "question": "Which Java feature introduced in Java 8 enables functional-style declarative pipeline processing of collections?",
      "options": [
        "Streams API",
        "Generics",
        "Reflection",
        "JNI (Java Native Interface)"
      ],
      "correctIndex": 0,
      "explanation": "Streams allow filter, map, reduce operations over sequences."
    },
    {
      "id": 19,
      "question": "In JPA/Hibernate, what does `@OneToMany(fetch = FetchType.LAZY)` specify?",
      "options": [
        "Related child entities are loaded from the database on demand when accessed, not eagerly",
        "Children are never loaded",
        "Data is fetched in a separate thread",
        "Only primary keys are stored in RAM"
      ],
      "correctIndex": 0,
      "explanation": "LAZY loading prevents N+1 queries by fetching child collections only when explicitly invoked."
    },
    {
      "id": 20,
      "question": "What exception is thrown in Java when an application attempts to use null where an object instance is required?",
      "options": [
        "NullPointerException",
        "IllegalArgumentException",
        "IndexOutOfBoundsException",
        "ClassNotFoundException"
      ],
      "correctIndex": 0,
      "explanation": "NullPointerException occurs when invoking methods or accessing fields on a null reference."
    },
    {
      "id": 21,
      "question": "Which Java keyword ensures that changes made to a variable by one thread are immediately visible to all other threads?",
      "options": [
        "volatile",
        "synchronized",
        "transient",
        "static"
      ],
      "correctIndex": 0,
      "explanation": "The `volatile` modifier forces thread reads and writes directly from/to main memory."
    },
    {
      "id": 22,
      "question": "In Java, what is the purpose of the `try-with-resources` statement?",
      "options": [
        "Automatically closes AutoCloseable resources (e.g., streams, DB connections) upon block completion",
        "Handles unchecked exceptions silently",
        "Reruns failed code blocks 3 times",
        "Encrypts local scope variables"
      ],
      "correctIndex": 0,
      "explanation": "try-with-resources guarantees automatic resource reclamation without manual finally blocks."
    },
    {
      "id": 23,
      "question": "Which interface in Java represents a task that can be executed concurrently and returns a result value?",
      "options": [
        "Callable<T>",
        "Runnable",
        "Thread",
        "Process"
      ],
      "correctIndex": 0,
      "explanation": "Callable<T>.call() returns a value and can throw checked exceptions, unlike Runnable."
    },
    {
      "id": 24,
      "question": "In Spring Boot, which annotation is used to handle global exceptions and format REST error payloads?",
      "options": [
        "@ControllerAdvice / @RestControllerAdvice",
        "@ExceptionHandler only",
        "@ErrorResponse",
        "@ComponentAdvice"
      ],
      "correctIndex": 0,
      "explanation": "@RestControllerAdvice provides centralized exception handling across controllers."
    },
    {
      "id": 25,
      "question": "What does the `transient` keyword signify when applied to a field in a Java class implementing Serializable?",
      "options": [
        "The field is excluded from serialization and will not be persisted in byte streams",
        "The field is immutable",
        "The field is stored in CPU registers",
        "The field is accessible by subclasses only"
      ],
      "correctIndex": 0,
      "explanation": "`transient` fields are skipped during JVM object serialization."
    },
    {
      "id": 26,
      "question": "Which Map implementation in Java provides thread-safe concurrent reads and bucket-level partitioned writes?",
      "options": [
        "ConcurrentHashMap",
        "Hashtable",
        "HashMap",
        "TreeMap"
      ],
      "correctIndex": 0,
      "explanation": "ConcurrentHashMap uses lock striping for high concurrent throughput without global locking."
    },
    {
      "id": 27,
      "question": "In Spring Data JPA, what naming convention automatically generates SQL query filters without writing manual JPQL?",
      "options": [
        "Derived Query Methods (e.g., findByEmailAndStatus)",
        "Custom JPQL required always",
        "Annotated Named Queries only",
        "Stored Procedures only"
      ],
      "correctIndex": 0,
      "explanation": "Spring Data parses method names like `findByLastNameAndActiveTrue` into SQL queries automatically."
    },
    {
      "id": 28,
      "question": "What is the JVM Garbage Collector responsible for?",
      "options": [
        "Reclaiming heap memory occupied by objects that are no longer reachable by any live thread",
        "Validating bytecode security",
        "Compiling Java files into .class",
        "Managing network sockets"
      ],
      "correctIndex": 0,
      "explanation": "GC automatically frees unreachable heap memory to prevent memory leaks."
    },
    {
      "id": 29,
      "question": "Which Spring Boot starter provides automated testing libraries including JUnit 5, Mockito, and AssertJ?",
      "options": [
        "spring-boot-starter-test",
        "spring-boot-starter-web",
        "spring-boot-starter-jpa",
        "spring-boot-starter-security"
      ],
      "correctIndex": 0,
      "explanation": "spring-boot-starter-test aggregates JUnit Jupiter, Mockito, and Spring Test runner."
    },
    {
      "id": 30,
      "question": "What does the `@Autowired` annotation in Spring perform?",
      "options": [
        "Injects matching bean dependencies from ApplicationContext into constructors, fields, or setters",
        "Generates getters and setters",
        "Creates database indexes",
        "Configures firewall rules"
      ],
      "correctIndex": 0,
      "explanation": "@Autowired enables automated dependency injection managed by Spring's IoC container."
    },
    {
      "id": 31,
      "question": "In Java 21 and Spring Boot 3.2+, what benefit does enabling Virtual Threads (`spring.threads.virtual.enabled=true`) provide?",
      "options": [
        "Allows high-throughput I/O-bound applications to handle tens of thousands of concurrent requests with lightweight threads",
        "Compiles Java code directly to native machine code ahead-of-time",
        "Disables garbage collection entirely for the JVM",
        "Increases the maximum memory allocated to the PermGen space"
      ],
      "correctIndex": 0,
      "explanation": "Virtual threads (Project Loom) provide lightweight user-mode threads managed by the JVM, ideal for blocking I/O throughput."
    },
    {
      "id": 32,
      "question": "What is the primary difference between `@RestController` and `@Controller` in Spring Boot?",
      "options": [
        "`@RestController` is a convenience annotation that combines `@Controller` and `@ResponseBody`, returning JSON/XML directly",
        "`@RestController` only handles WebSocket connections",
        "`@Controller` automatically serializes method returns to JSON",
        "`@RestController` is deprecated in Spring Framework 6"
      ],
      "correctIndex": 0,
      "explanation": "@RestController adds @ResponseBody automatically so returned objects are written directly to the HTTP response body as JSON/XML."
    },
    {
      "id": 33,
      "question": "How does Spring Boot resolve the Hibernate 'N+1 Selects' performance issue in `@OneToMany` relationships?",
      "options": [
        "Using `JOIN FETCH` in JPQL or applying `@EntityGraph` to eagerly load associations in a single SQL query",
        "Setting `spring.jpa.open-in-view=true`",
        "Disabling database foreign keys in the schema",
        "Converting all database tables to NoSQL collections"
      ],
      "correctIndex": 0,
      "explanation": "JOIN FETCH or @EntityGraph instructs Hibernate to join the parent and child tables in a single query instead of executing 1 initial query + N secondary queries."
    },
    {
      "id": 34,
      "question": "In Spring Security 6, how is web request security configured without extending deprecated `WebSecurityConfigurerAdapter`?",
      "options": [
        "By declaring a `@Bean` returning a `SecurityFilterChain` configured via HttpSecurity lambda DSL",
        "By modifying web.xml in the WEB-INF folder",
        "By adding `@EnableWebSecurity` to every `@RestController` class",
        "By configuring security rules in application.properties only"
      ],
      "correctIndex": 0,
      "explanation": "Spring Security 6 adopts component-based security using a @Bean of type SecurityFilterChain with modern lambda DSL."
    },
    {
      "id": 35,
      "question": "What does `@Transactional(readOnly = true)` do in a Spring Data JPA service method?",
      "options": [
        "Optimizes database session by disabling dirty checking and enabling read-replica routing",
        "Deletes the database connection after query execution",
        "Allows the service method to write only to temporary tables",
        "Locks the entire database table against concurrent reads"
      ],
      "correctIndex": 0,
      "explanation": "readOnly=true informs the persistence provider to skip dirty checking snapshotting, saving CPU and memory."
    },
    {
      "id": 36,
      "question": "Which HTTP status code should a REST API return when a client attempts to create an entity with an email that already exists?",
      "options": [
        "409 Conflict",
        "404 Not Found",
        "502 Bad Gateway",
        "204 No Content"
      ],
      "correctIndex": 0,
      "explanation": "HTTP 409 Conflict indicates the request cannot be completed due to a conflict with current resource state (e.g., unique key violation)."
    },
    {
      "id": 37,
      "question": "What is the role of OpenFeign in a Spring Cloud microservices architecture?",
      "options": [
        "A declarative HTTP client that generates REST API caller implementations from Java interface annotations",
        "A distributed message queue for asynchronous event streaming",
        "A service mesh sidecar proxy written in Go",
        "An in-memory distributed cache replacing Redis"
      ],
      "correctIndex": 0,
      "explanation": "Spring Cloud OpenFeign allows developers to write declarative REST client interfaces using Spring MVC annotations."
    },
    {
      "id": 38,
      "question": "In Spring Boot Actuator, which endpoint exposes metrics in a format directly scrapable by Prometheus?",
      "options": [
        "/actuator/prometheus",
        "/actuator/health",
        "/actuator/env",
        "/actuator/beans"
      ],
      "correctIndex": 0,
      "explanation": "The /actuator/prometheus endpoint uses Micrometer to expose metrics formatted in the Prometheus exposition standard."
    },
    {
      "id": 39,
      "question": "How does Resilience4j's Circuit Breaker protect downstream microservices from cascading failures?",
      "options": [
        "By transitioning to OPEN state after a failure threshold is exceeded, failing fast and preventing overloaded calls",
        "By automatically increasing server RAM and CPU",
        "By permanently blocking all incoming client IP addresses",
        "By rerouting network packets to the public internet"
      ],
      "correctIndex": 0,
      "explanation": "Circuit Breakers trip to OPEN when error rates cross a threshold, rejecting calls instantly to protect both caller and callee."
    },
    {
      "id": 40,
      "question": "What is the primary advantage of Flyway or Liquibase in Spring Boot applications?",
      "options": [
        "Version-controlled, repeatable, and automated database schema migrations across all environments",
        "Automated SQL query optimization and query cache management",
        "Direct generation of frontend React components from SQL tables",
        "Real-time replication between PostgreSQL and MongoDB"
      ],
      "correctIndex": 0,
      "explanation": "Flyway and Liquibase track schema change scripts in version control, running pending migrations automatically on startup."
    },
    {
      "id": 41,
      "question": "In Spring Boot, which annotation handles global exception processing across all controllers?",
      "options": [
        "`@RestControllerAdvice` combined with `@ExceptionHandler`",
        "`@ControllerError`",
        "`@CatchAll`",
        "`@GlobalErrorFilter`"
      ],
      "correctIndex": 0,
      "explanation": "@RestControllerAdvice provides centralized exception interception with automatic JSON serialization."
    },
    {
      "id": 42,
      "question": "What is Testcontainers primarily used for in Spring Boot integration tests?",
      "options": [
        "Spinning up real throwaway Docker containers (e.g. Postgres, Kafka, Redis) for authentic end-to-end integration tests",
        "Packaging the Spring Boot JAR into an Android APK",
        "Monitoring production CPU utilization",
        "Compiling Java source files to WebAssembly"
      ],
      "correctIndex": 0,
      "explanation": "Testcontainers orchestrates real Docker containers during integration tests, eliminating fragile in-memory database mocks like H2."
    },
    {
      "id": 43,
      "question": "What does `@Cacheable(\"products\")` do when placed on a Spring service method?",
      "options": [
        "Checks the cache first; if present returns cached value without executing method, otherwise executes and stores result",
        "Clears the cache every time the method is invoked",
        "Stores the method return value in browser localStorage",
        "Locks the database table while the method executes"
      ],
      "correctIndex": 0,
      "explanation": "@Cacheable implements cache-aside pattern: bypasses method body on cache hit, executes and populates cache on miss."
    },
    {
      "id": 44,
      "question": "In Kafka integration with Spring Boot (`spring-kafka`), what does `@KafkaListener` do?",
      "options": [
        "Subscribes a method to listen to messages published on specified Kafka topics",
        "Publishes HTTP webhooks to external API servers",
        "Creates Kafka topics in the cluster automatically",
        "Monitors Kafka broker memory utilization"
      ],
      "correctIndex": 0,
      "explanation": "@KafkaListener marks a method as the target of a Kafka message listener on specified topics."
    },
    {
      "id": 45,
      "question": "What is the difference between `@Valid` and `@Validated` in Spring Boot?",
      "options": [
        "`@Validated` is a Spring-specific variant that supports validation groups, while `@Valid` is standard JSR-380 / Jakarta Validation",
        "`@Valid` works only on XML files",
        "`@Validated` cannot be used on Controller request bodies",
        "`@Valid` disables all validation checks in production"
      ],
      "correctIndex": 0,
      "explanation": "@Validated is Spring's extension of standard Jakarta @Valid, supporting validation groups and method-level validation."
    },
    {
      "id": 46,
      "question": "How does Spring Boot handle Graceful Shutdown (`server.shutdown=graceful`)?",
      "options": [
        "Stops accepting new requests and allows active in-flight requests to complete within a timeout period before terminating",
        "Instantly kills all threads with SIGKILL",
        "Creates a full memory dump of the JVM to disk",
        "Reboots the physical host machine"
      ],
      "correctIndex": 0,
      "explanation": "Graceful shutdown rejects new incoming requests and gives active in-flight HTTP requests time to finish safely."
    },
    {
      "id": 47,
      "question": "Which Jackson annotation ignores `null` fields during JSON serialization?",
      "options": [
        "`@JsonInclude(JsonInclude.Include.NON_NULL)`",
        "`@JsonIgnoreNull`",
        "`@JsonSkipEmpty`",
        "`@JsonSuppress`"
      ],
      "correctIndex": 0,
      "explanation": "@JsonInclude(JsonInclude.Include.NON_NULL) instructs Jackson to omit fields with null values from generated JSON."
    },
    {
      "id": 48,
      "question": "What does `@Version` annotation on an entity field in JPA enable?",
      "options": [
        "Optimistic concurrency control by verifying the version hasn't changed before updating",
        "Database schema version tracking in git",
        "API endpoint versioning in URL paths",
        "Java compiler version compatibility enforcement"
      ],
      "correctIndex": 0,
      "explanation": "JPA uses @Version for optimistic locking: throws OptimisticLockException if another transaction updated the row concurrently."
    },
    {
      "id": 49,
      "question": "In Spring WebFlux, what is the fundamental difference between `Mono<T>` and `Flux<T>`?",
      "options": [
        "`Mono` emits at most 1 item (0 or 1), whereas `Flux` emits a reactive stream of 0 to N items",
        "`Mono` is synchronous while `Flux` is asynchronous",
        "`Flux` is only used for WebSocket messaging",
        "`Mono` requires Java 8 while `Flux` requires Java 21"
      ],
      "correctIndex": 0,
      "explanation": "Mono represents a Publisher that emits at most one element (or error), while Flux emits an asynchronous sequence of 0..N elements."
    },
    {
      "id": 50,
      "question": "How should sensitive database credentials be supplied to a Spring Boot microservice in production?",
      "options": [
        "Via environment variables or a cloud secrets manager (e.g. AWS Secrets Manager, Vault), never committed to git",
        "Hardcoded directly in application.properties",
        "Stored in a public README.md file",
        "Passed as plain-text URL query parameters"
      ],
      "correctIndex": 0,
      "explanation": "Secrets must always be injected at runtime via environment variables or secret vaults and never committed into source control."
    },
    {
      "id": 51,
      "question": "What is the purpose of Spring Cloud Config Server in microservice architectures?",
      "options": [
        "Provides centralized externalized configuration management across all microservices and environments",
        "Compiles Java code in the cloud",
        "Acts as an SQL database replica",
        "Routes WebSocket packets directly to browsers"
      ],
      "correctIndex": 0,
      "explanation": "Spring Cloud Config Server provides an HTTP resource-based API for externalized configuration across environments."
    },
    {
      "id": 52,
      "question": "In Spring Boot, what does `@RefreshScope` do on a Spring Bean?",
      "options": [
        "Allows bean properties to be reloaded dynamically at runtime upon `/actuator/refresh` without restarting the JVM",
        "Refreshes the client browser page every 10 seconds",
        "Clears the browser cache",
        "Reboots the operating system"
      ],
      "correctIndex": 0,
      "explanation": "@RefreshScope beans are re-initialized dynamically when configuration changes are published to /actuator/refresh."
    },
    {
      "id": 53,
      "question": "What is the function of the `@EntityGraph` annotation in Spring Data JPA repository methods?",
      "options": [
        "Overrides default lazy-loading by specifying which attributes should be fetched eagerly in a single join query",
        "Renders graph diagrams of database entities",
        "Creates Neo4j graph nodes from entities",
        "Validates JSON syntax"
      ],
      "correctIndex": 0,
      "explanation": "@EntityGraph defines a fetch plan to load related entities in 1 query, eliminating N+1 lazy loading issues."
    },
    {
      "id": 54,
      "question": "In Spring Security, what is the role of `JwtAuthenticationConverter`?",
      "options": [
        "Extracts custom claims (such as roles, permissions) from a validated JWT and maps them to Spring Security `GrantedAuthority` objects",
        "Encrypts the database with AES-256",
        "Converts XML requests into JSON",
        "Generates SSL certificates"
      ],
      "correctIndex": 0,
      "explanation": "JwtAuthenticationConverter translates JWT claims (e.g., 'roles' or 'scope') into Spring GrantedAuthority objects."
    },
    {
      "id": 55,
      "question": "How does Spring Boot configure connection pooling by default?",
      "options": [
        "Uses HikariCP as the default high-performance JDBC connection pool",
        "Creates a new TCP socket connection for every single query",
        "Uses Apache DBCP1",
        "Uses Tomcat JDBC pool"
      ],
      "correctIndex": 0,
      "explanation": "HikariCP is the default connection pool in Spring Boot due to its superior speed and lightweight footprint."
    },
    {
      "id": 56,
      "question": "What does `@ConditionalOnProperty(name = \"features.ai.enabled\", havingValue = \"true\")` do?",
      "options": [
        "Instantiates the annotated bean only if the specified configuration property exists and matches the given value",
        "Throws an exception if the property is missing",
        "Deletes the bean from disk",
        "Enables the property on AWS"
      ],
      "correctIndex": 0,
      "explanation": "@ConditionalOnProperty conditionally creates beans based on presence and value of application properties."
    },
    {
      "id": 57,
      "question": "In microservices, what does the Saga Orchestration pattern use to manage distributed transactions?",
      "options": [
        "A centralized orchestrator service that coordinates workflow steps and triggers compensating transactions on failure",
        "Distributed 2-phase commit locking across all databases",
        "Direct database-to-database replication",
        "Manual operator intervention"
      ],
      "correctIndex": 0,
      "explanation": "An orchestrator centrally tells participants what local transactions to execute and triggers compensations on errors."
    },
    {
      "id": 58,
      "question": "In Spring Boot, how can long-running tasks be offloaded from web request threads?",
      "options": [
        "Annotate the service method with `@Async` and configure a dedicated `ThreadPoolTaskExecutor` bean",
        "Use `Thread.sleep(1000)` inside the controller",
        "Run the task inside a SQL stored procedure",
        "Make the controller method private"
      ],
      "correctIndex": 0,
      "explanation": "@Async runs methods in a separate thread pool managed by Spring TaskExecutor without blocking the HTTP request thread."
    },
    {
      "id": 59,
      "question": "What does Spring Data `@Query(value = \"...\", nativeQuery = true)` execute?",
      "options": [
        "Raw SQL directly executed by the underlying database engine, bypassing JPQL abstract syntax",
        "Compiled C++ code",
        "MongoDB queries",
        "Python scripts"
      ],
      "correctIndex": 0,
      "explanation": "nativeQuery=true passes the query directly to the database SQL engine without JPQL translation."
    },
    {
      "id": 60,
      "question": "In Java 21, what is Pattern Matching for `switch`?",
      "options": [
        "Allows testing an expression against multiple patterns with type checking and extraction in a single expressive switch block",
        "A tool for regular expression string search",
        "A design pattern for creating threads",
        "A CSS selector compiler"
      ],
      "correctIndex": 0,
      "explanation": "Java 21 pattern matching for switch enables concise type checking and conditional extraction without verbose instanceof cascades."
    }
  ],
  "react": [
    {
      "id": 1,
      "question": "In React 18+, which hook is used to manage mutable values or hold DOM node references without causing re-renders?",
      "options": [
        "useRef",
        "useState",
        "useMemo",
        "useCallback"
      ],
      "correctIndex": 0,
      "explanation": "useRef persists values across renders without triggering a component re-render when mutated."
    },
    {
      "id": 2,
      "question": "Which React hook memoizes the computed return value of an expensive calculation?",
      "options": [
        "useMemo",
        "useCallback",
        "useEffect",
        "useReducer"
      ],
      "correctIndex": 0,
      "explanation": "useMemo caches the result of a function calculation until dependencies change."
    },
    {
      "id": 3,
      "question": "Which React hook memoizes a function definition across re-renders to prevent unnecessary child component updates?",
      "options": [
        "useCallback",
        "useMemo",
        "useRef",
        "useEffect"
      ],
      "correctIndex": 0,
      "explanation": "useCallback preserves a stable function reference between renders."
    },
    {
      "id": 4,
      "question": "In React Router / Expo Router, which hook is used to access dynamic URL route parameters (e.g. `/videos/:id`)?",
      "options": [
        "useLocalSearchParams",
        "usePathname",
        "useRoute",
        "useParams"
      ],
      "correctIndex": 0,
      "explanation": "Expo Router provides useLocalSearchParams to extract route parameters."
    },
    {
      "id": 5,
      "question": "What is the Virtual DOM in React?",
      "options": [
        "An in-memory lightweight representation of the actual DOM used for fast diffing and batch updates",
        "A browser extension",
        "A cloud server replica",
        "A WebGL 3D canvas"
      ],
      "correctIndex": 0,
      "explanation": "React compares VDOM snapshots via reconciliation and applies minimal real DOM mutations."
    },
    {
      "id": 6,
      "question": "In React, why must state updates in `useState` never be performed by mutating state directly?",
      "options": [
        "Direct mutations bypass React's shallow comparison, preventing component re-rendering and UI updates",
        "Direct mutations crash the JavaScript engine",
        "Browser prevents object modification",
        "Mutations are converted to strings"
      ],
      "correctIndex": 0,
      "explanation": "React relies on referential inequality (Object.is) to schedule re-renders."
    },
    {
      "id": 7,
      "question": "What is the cleanup function in `useEffect` used for?",
      "options": [
        "Canceling subscriptions, clearing intervals/timers, and preventing memory leaks when unmounting",
        "Deleting component files from disk",
        "Purging browser history",
        "Stopping network servers"
      ],
      "correctIndex": 0,
      "explanation": "Returning a function from useEffect executes cleanup before re-running or when unmounting."
    },
    {
      "id": 8,
      "question": "In Next.js App Router (13+ / 14+), what is the default rendering paradigm for components in the `app` directory?",
      "options": [
        "React Server Components (RSC)",
        "Client Components ('use client')",
        "Static HTML Pages only",
        "Edge Workers only"
      ],
      "correctIndex": 0,
      "explanation": "Next.js App Router renders components on the server by default unless 'use client' is declared."
    },
    {
      "id": 9,
      "question": "What TypeScript utility type constructs a type with all properties of T set to optional?",
      "options": [
        "Partial<T>",
        "Required<T>",
        "Readonly<T>",
        "Pick<T, K>"
      ],
      "correctIndex": 0,
      "explanation": "Partial<T> makes all keys in an interface optional."
    },
    {
      "id": 10,
      "question": "What does TypeScript's `unknown` type represent compared to `any`?",
      "options": [
        "Type-safe counterpart of any that requires type narrowing or casting before performing operations",
        "A primitive number",
        "An undefined function",
        "Identical to any in every way"
      ],
      "correctIndex": 0,
      "explanation": "`unknown` forces explicit type checking before properties can be accessed."
    },
    {
      "id": 11,
      "question": "Which tool is standard in React Native Expo projects for fast file-system based routing across web and mobile?",
      "options": [
        "Expo Router",
        "React Navigation standalone only",
        "Next.js router",
        "Express router"
      ],
      "correctIndex": 0,
      "explanation": "Expo Router builds upon React Navigation with file-based conventions matching Next.js."
    },
    {
      "id": 12,
      "question": "What is the purpose of React Error Boundaries?",
      "options": [
        "Catch JavaScript errors anywhere in their child component tree and display a fallback UI",
        "Catch network 404 errors",
        "Validate TypeScript types at runtime",
        "Encrypt component code"
      ],
      "correctIndex": 0,
      "explanation": "Error Boundaries catch rendering errors in lifecycle methods and render alternate fallback views."
    },
    {
      "id": 13,
      "question": "In React Native, which primitive component renders a scrollable list with virtualized recycling for 1,000+ items?",
      "options": [
        "FlatList",
        "ScrollView",
        "View",
        "VirtualizedList only"
      ],
      "correctIndex": 0,
      "explanation": "FlatList renders only visible elements on screen to optimize mobile memory and FPS."
    },
    {
      "id": 14,
      "question": "Which hook is recommended for complex state logic with multiple sub-values or predictable action transitions?",
      "options": [
        "useReducer",
        "useState",
        "useContext",
        "useId"
      ],
      "correctIndex": 0,
      "explanation": "useReducer manages state transitions using actions and pure reducer functions."
    },
    {
      "id": 15,
      "question": "What does React Context API provide?",
      "options": [
        "A way to share values (e.g. auth, theme) between components without passing props down manually at every level",
        "A database connection",
        "A background cron job",
        "An HTTP proxy"
      ],
      "correctIndex": 0,
      "explanation": "Context avoids prop drilling across deep component hierarchies."
    },
    {
      "id": 16,
      "question": "What is the purpose of the `key` prop when rendering arrays of components in React?",
      "options": [
        "Helps React identify which items have changed, been added, or removed during reconciliation",
        "Sets the CSS class name",
        "Generates HTML id attributes",
        "Determines flex order"
      ],
      "correctIndex": 0,
      "explanation": "Keys provide stable identities for efficient list diffing."
    },
    {
      "id": 17,
      "question": "In React Native, how is styling primarily authored?",
      "options": [
        "JavaScript StyleSheet objects using flexbox layout and density-independent pixels",
        "Standard CSS stylesheets (.css)",
        "SCSS preprocessors",
        "Bootstrap classes only"
      ],
      "correctIndex": 0,
      "explanation": "React Native uses StyleSheet.create() with flexbox layout paradigms."
    },
    {
      "id": 18,
      "question": "What does `async/await` syntax in JavaScript/TypeScript represent under the hood?",
      "options": [
        "Syntactic sugar over Promises and the JavaScript event loop microtask queue",
        "Multi-threaded native OS execution",
        "Blocking synchronous threads",
        "Direct assembly instructions"
      ],
      "correctIndex": 0,
      "explanation": "async/await simplifies Promise consumption without blocking the main event thread."
    },
    {
      "id": 19,
      "question": "Which library is the industry standard in React for server-state caching, synchronization, and background revalidation?",
      "options": [
        "TanStack Query (React Query)",
        "Redux only",
        "MobX",
        "Axios standalone"
      ],
      "correctIndex": 0,
      "explanation": "TanStack Query automates caching, deduplication, and background updates."
    },
    {
      "id": 20,
      "question": "What is tree-shaking in modern JavaScript bundlers (Webpack, Metro, Rollup)?",
      "options": [
        "Dead-code elimination that removes unused exports from the final production bundle",
        "Compressing PNG assets",
        "Minifying HTML tags",
        "Reordering source files"
      ],
      "correctIndex": 0,
      "explanation": "Tree-shaking statically analyzes ES module imports/exports to drop unused code paths."
    },
    {
      "id": 21,
      "question": "In React 18/19, what is the purpose of the `useTransition` hook?",
      "options": [
        "Marks state updates as non-urgent transitions, keeping the user interface responsive during heavy UI re-renders",
        "Animates CSS keyframes between page routes",
        "Transitions class components into functional components",
        "Migrates Redux stores to React Context automatically"
      ],
      "correctIndex": 0,
      "explanation": "useTransition allows developers to mark updates as non-urgent transitions, allowing urgent updates (like typing in an input) to interrupt them."
    },
    {
      "id": 22,
      "question": "In React Server Components (RSC) architecture, what is the default rendering behavior of components?",
      "options": [
        "Components are Server Components by default; client interactivity requires an explicit `'use client'` directive at the top of the file",
        "All components render exclusively on the client",
        "Server Components require running PHP on the server",
        "Server Components cannot fetch data from databases"
      ],
      "correctIndex": 0,
      "explanation": "In modern React/Next.js App Router, components default to Server Components, reducing client bundle size by running on the server."
    },
    {
      "id": 23,
      "question": "Why should array indices never be used as `key` props for dynamically reorderable or filterable lists in React?",
      "options": [
        "Indices confuse React's Fiber reconciliation algorithm, causing state bugs, uncontrolled input mismatches, and broken component animations",
        "Array indices are converted to string hashes that crash JavaScript engines",
        "Keys must always be cryptographically signed hashes",
        "React throws a fatal runtime exception if an index is passed as key"
      ],
      "correctIndex": 0,
      "explanation": "When list order changes, items retain their previous index-based key, causing React to misidentify component instances and preserve wrong state."
    },
    {
      "id": 24,
      "question": "What is the primary difference between `useCallback` and `useMemo` in React performance optimization?",
      "options": [
        "`useCallback` caches a function definition between renders; `useMemo` caches the calculated return value of a function",
        "`useCallback` runs synchronously; `useMemo` runs asynchronously",
        "`useMemo` is only used for caching network requests",
        "`useCallback` is deprecated in React 18"
      ],
      "correctIndex": 0,
      "explanation": "useCallback(fn, deps) is equivalent to useMemo(() => fn, deps): it memoizes the callback instance to prevent re-creating function references."
    },
    {
      "id": 25,
      "question": "What causes a 'Hydration Mismatch' error in Next.js / React SSR?",
      "options": [
        "When the initial HTML markup generated by the server does not match the DOM tree rendered during the first client pass (e.g. using `window` or `Date.now()`)",
        "When the server runs out of RAM during compilation",
        "When a CSS file fails to load over the network",
        "When database passwords don't match across microservices"
      ],
      "correctIndex": 0,
      "explanation": "Hydration errors occur when the server-rendered HTML diverges from the client's initial render output, often due to browser-only globals."
    },
    {
      "id": 26,
      "question": "In React 18, how does Automatic Batching change state update behavior?",
      "options": [
        "Batches multiple state updates into a single re-render even inside Promises, setTimeout callbacks, and native event handlers",
        "Sends state updates in batches over WebSockets to the server",
        "Automatically groups database queries in batches",
        "Requires wrapping every setState in `batch()`"
      ],
      "correctIndex": 0,
      "explanation": "Before React 18, only updates inside React event handlers were batched. React 18 automatically batches across async contexts for optimal performance."
    },
    {
      "id": 27,
      "question": "In TanStack React Query, what does `queryClient.invalidateQueries({ queryKey: ['profile'] })` trigger?",
      "options": [
        "Marks cached query data as stale and automatically triggers a background refetch if the query is currently rendered on screen",
        "Permanently wipes the profile database table",
        "Logs the user out of the application",
        "Throws a network timeout error"
      ],
      "correctIndex": 0,
      "explanation": "invalidateQueries invalidates active queries matching the key, ensuring the UI synchronizes with the latest backend server state."
    },
    {
      "id": 28,
      "question": "What problem does the `useId` hook solve in React 18+?",
      "options": [
        "Generates unique, collision-free HTML element IDs that are guaranteed to match identically between server rendering and client hydration",
        "Generates random UUIDs for database primary keys",
        "Authenticates user session tokens",
        "Hashes passwords on the client side"
      ],
      "correctIndex": 0,
      "explanation": "useId provides stable, unique accessibility IDs (e.g. for aria-describedby and labels) that match seamlessly across SSR and client."
    },
    {
      "id": 29,
      "question": "Why can React Hooks NOT be called conditionally (e.g. inside an `if` block or loop)?",
      "options": [
        "React relies on the exact invocation order of hooks on every render to correctly associate internal state with corresponding hook cells",
        "JavaScript engines prohibit calling functions inside if blocks",
        "Conditional hooks cause memory leaks in the browser V8 engine",
        "Hooks require WebAssembly compilation"
      ],
      "correctIndex": 0,
      "explanation": "React stores hook states in a linked list per component. If an if condition alters the order of hooks between renders, all subsequent states become misaligned."
    },
    {
      "id": 30,
      "question": "In React 19, what does the `useOptimistic` hook allow developers to do?",
      "options": [
        "Immediately update the UI with an expected optimistic outcome while an asynchronous background action is in progress",
        "Automatically fixes JavaScript syntax errors",
        "Guarantees network requests will never fail",
        "Optimizes image file sizes"
      ],
      "correctIndex": 0,
      "explanation": "useOptimistic provides immediate UI feedback while waiting for a server action to finish, reverting if it fails."
    },
    {
      "id": 31,
      "question": "What does `React.memo(Component, arePropsEqual)` do?",
      "options": [
        "Prevents re-rendering of a functional component if its props have not changed according to the comparison function",
        "Saves the component in browser localStorage",
        "Compiles the component into native machine code",
        "Converts state to Redux"
      ],
      "correctIndex": 0,
      "explanation": "React.memo is a higher-order component that memoizes the rendered output, skipping re-renders if props are unchanged."
    },
    {
      "id": 32,
      "question": "In Next.js 14, what is the purpose of Server Actions declared with `'use server'`?",
      "options": [
        "Asynchronous functions executed on the server that can be called directly from client or server components without manual API endpoints",
        "CSS stylesheets that render exclusively on the server",
        "Docker container configuration scripts",
        "Database foreign keys"
      ],
      "correctIndex": 0,
      "explanation": "Server Actions allow forms and mutations to invoke server-side logic directly with end-to-end type safety."
    },
    {
      "id": 33,
      "question": "What is the difference between controlled and uncontrolled components in React forms?",
      "options": [
        "Controlled components have form data handled by React state via `value` and `onChange`; uncontrolled components use DOM `ref`s",
        "Controlled components cannot be submitted",
        "Uncontrolled components cannot be styled with CSS",
        "They are identical"
      ],
      "correctIndex": 0,
      "explanation": "Controlled components keep React state as the single source of truth; uncontrolled components let the DOM manage state."
    },
    {
      "id": 34,
      "question": "In React Native, what replaced the old asynchronous JSON bridge in the New Architecture?",
      "options": [
        "JavaScript Interface (JSI) enabling direct, synchronous C++ host object calls without JSON serialization",
        "WebSockets",
        "HTTP/2 push",
        "Local SQLite databases"
      ],
      "correctIndex": 0,
      "explanation": "JSI allows JavaScript code to hold direct references to C++ host objects, eliminating bridge serialization bottlenecks."
    }
  ],
  "cloud": [
    {
      "id": 1,
      "question": "What AWS service provides resizable on-demand compute capacity as virtual cloud servers?",
      "options": [
        "Amazon EC2 (Elastic Compute Cloud)",
        "Amazon S3",
        "AWS Lambda",
        "Amazon RDS"
      ],
      "correctIndex": 0,
      "explanation": "EC2 provides virtual machines (instances) running in AWS data centers."
    },
    {
      "id": 2,
      "question": "What storage class in AWS S3 is optimized for long-term archiving of rarely accessed data with low storage cost?",
      "options": [
        "S3 Glacier",
        "S3 Standard",
        "S3 Intelligent-Tiering",
        "S3 One Zone-IA"
      ],
      "correctIndex": 0,
      "explanation": "S3 Glacier is designed for cold archival with multi-hour retrieval options."
    },
    {
      "id": 3,
      "question": "In Docker, which file instruction sets the base image for subsequent container build instructions?",
      "options": [
        "FROM",
        "RUN",
        "CMD",
        "ENTRYPOINT"
      ],
      "correctIndex": 0,
      "explanation": "FROM specifies the parent base image (e.g., `FROM node:20-alpine`)."
    },
    {
      "id": 4,
      "question": "What is the primary difference between `CMD` and `ENTRYPOINT` in a Dockerfile?",
      "options": [
        "ENTRYPOINT defines the fixed executable; CMD specifies default arguments that can be overridden",
        "CMD cannot be overridden",
        "ENTRYPOINT only works on Linux",
        "They are identical aliases"
      ],
      "correctIndex": 0,
      "explanation": "ENTRYPOINT defines container executable; CMD provides default overridable parameters."
    },
    {
      "id": 5,
      "question": "What Kubernetes resource represents the smallest deployable compute unit consisting of one or more co-located containers?",
      "options": [
        "Pod",
        "Service",
        "Deployment",
        "Namespace"
      ],
      "correctIndex": 0,
      "explanation": "A Pod encapsulates one or more shared-context containers."
    },
    {
      "id": 6,
      "question": "Which Kubernetes controller ensures a specified number of identical Pod replicas are running at all times?",
      "options": [
        "Deployment / ReplicaSet",
        "DaemonSet",
        "Job",
        "ConfigMap"
      ],
      "correctIndex": 0,
      "explanation": "Deployments manage ReplicaSets to maintain desired state and perform rolling updates."
    },
    {
      "id": 7,
      "question": "What tool allows declarative definition and provisioning of cloud infrastructure as code (IaC) across multiple providers?",
      "options": [
        "Terraform",
        "Ansible",
        "Kubernetes",
        "Docker Compose"
      ],
      "correctIndex": 0,
      "explanation": "HashiCorp Terraform uses HCL to manage cloud resources declaratively."
    },
    {
      "id": 8,
      "question": "Which AWS service is a fully managed serverless compute platform that runs code in response to events without managing servers?",
      "options": [
        "AWS Lambda",
        "Amazon ECS",
        "AWS Elastic Beanstalk",
        "Amazon EKS"
      ],
      "correctIndex": 0,
      "explanation": "AWS Lambda executes event-driven functions with automatic scaling and zero idle billing."
    },
    {
      "id": 9,
      "question": "What open-source metrics monitoring and time-series database is widely used in cloud-native Kubernetes environments?",
      "options": [
        "Prometheus",
        "Grafana",
        "ELK Stack",
        "Jaeger"
      ],
      "correctIndex": 0,
      "explanation": "Prometheus scrapes and stores pull-based multidimensional time-series metrics."
    },
    {
      "id": 10,
      "question": "What visualization dashboard tool is standard for plotting metrics scraped by Prometheus and cloud backends?",
      "options": [
        "Grafana",
        "Kibana",
        "Tableau",
        "Splunk"
      ],
      "correctIndex": 0,
      "explanation": "Grafana renders charts and dashboards querying Prometheus, PostgreSQL, and CloudWatch."
    },
    {
      "id": 11,
      "question": "In Docker networking, what default bridge network allows containers on the same host to communicate via IP?",
      "options": [
        "bridge",
        "host",
        "overlay",
        "none"
      ],
      "correctIndex": 0,
      "explanation": "The default `bridge` driver provides private internal IP communication."
    },
    {
      "id": 12,
      "question": "What is a multi-stage Docker build used for?",
      "options": [
        "Minimizing final image size by discarding build tools, compilers, and intermediate layers",
        "Running containers in multiple cloud regions",
        "Splitting containers across CPUs",
        "Running tests in parallel"
      ],
      "correctIndex": 0,
      "explanation": "Multi-stage builds copy only compiled artifacts into a lightweight runtime image (e.g. Alpine)."
    },
    {
      "id": 13,
      "question": "What does CI/CD stand for in modern DevOps pipelines?",
      "options": [
        "Continuous Integration & Continuous Delivery / Continuous Deployment",
        "Cloud Infrastructure & Container Deployment",
        "Centralized Indexing & Code Distribution",
        "Compute Instances & Cluster Data"
      ],
      "correctIndex": 0,
      "explanation": "CI/CD automates linting, testing, building, and deployment to production."
    },
    {
      "id": 14,
      "question": "In AWS, which service acts as a global Content Delivery Network (CDN) delivering cached content with low latency?",
      "options": [
        "Amazon CloudFront",
        "Amazon Route 53",
        "AWS Direct Connect",
        "Amazon VPC"
      ],
      "correctIndex": 0,
      "explanation": "CloudFront caches static and dynamic web content at edge locations worldwide."
    },
    {
      "id": 15,
      "question": "What is the function of a Kubernetes Ingress controller?",
      "options": [
        "Routes external HTTP/HTTPS traffic from outside the cluster to internal Kubernetes Services",
        "Monitors node hardware temperatures",
        "Encrypts container disk volumes",
        "Schedules backup cron jobs"
      ],
      "correctIndex": 0,
      "explanation": "Ingress manages external load balancing, SSL termination, and name-based virtual hosting."
    },
    {
      "id": 16,
      "question": "In Kubernetes, what is the key difference between a Deployment and a StatefulSet?",
      "options": [
        "StatefulSets provide stable unique network identifiers, ordered graceful deployment, and persistent volume guarantees for stateful apps",
        "Deployments are only used for Windows containers",
        "StatefulSets cannot be scaled horizontally",
        "Deployments do not support rolling updates"
      ],
      "correctIndex": 0,
      "explanation": "StatefulSets maintain stable pod identities (e.g. pod-0, pod-1) and dedicated persistent volumes, vital for databases and distributed clusters."
    },
    {
      "id": 17,
      "question": "What is the purpose of Docker multi-stage builds in container optimization?",
      "options": [
        "Separates build-time dependencies (compilers, SDKs) from the final runtime image, resulting in minimal image size and reduced attack surface",
        "Runs containers simultaneously across multiple cloud providers",
        "Allows multiple operating systems to run inside one container",
        "Compiles Dockerfiles into Kubernetes manifests"
      ],
      "correctIndex": 0,
      "explanation": "Multi-stage builds leave behind compilers and temporary build artifacts, packaging only the compiled binary and runtime into the final image."
    },
    {
      "id": 18,
      "question": "In Kubernetes, what is the role of a Readiness Probe versus a Liveness Probe?",
      "options": [
        "Readiness determines if the pod should receive service traffic; Liveness determines if the container has crashed and must be restarted",
        "Readiness restarts the container; Liveness sends traffic",
        "Both probes perform identical operations",
        "Readiness is used only during container build time"
      ],
      "correctIndex": 0,
      "explanation": "A failing readiness probe stops routing traffic to the pod. A failing liveness probe triggers a container restart by the kubelet."
    },
    {
      "id": 19,
      "question": "In AWS VPC networking, what is the purpose of a NAT Gateway?",
      "options": [
        "Enables instances in a private subnet to connect outbound to the internet (e.g. for software updates) while preventing unsolicited inbound traffic",
        "Translates domain names to IP addresses for public websites",
        "Acts as a hardware firewall between AWS regions",
        "Compresses HTTP traffic entering the VPC"
      ],
      "correctIndex": 0,
      "explanation": "NAT Gateways provide outbound-only internet connectivity for private subnet instances without exposing their private IP addresses to the public web."
    },
    {
      "id": 20,
      "question": "In Terraform, why is a remote state lock (e.g. using AWS DynamoDB with S3) critical for team collaboration?",
      "options": [
        "Prevents concurrent executions from creating race conditions and corrupting the shared Terraform state file",
        "Encrypts Terraform passwords using quantum cryptography",
        "Translates HCL syntax into YAML manifests",
        "Accelerates internet upload bandwidth"
      ],
      "correctIndex": 0,
      "explanation": "DynamoDB state locking ensures only one team member or CI/CD runner can apply Terraform modifications to the infrastructure at any instant."
    },
    {
      "id": 21,
      "question": "What is the fundamental difference between Blue-Green deployments and Canary releases?",
      "options": [
        "Blue-Green switches 100% traffic between identical environments; Canary routes a small percentage of traffic to the new version first to monitor stability",
        "Canary releases require manual server reboots",
        "Blue-Green deployments do not support rollback",
        "Canary releases only apply to database schema changes"
      ],
      "correctIndex": 0,
      "explanation": "Canary deploys to a small subset of users (e.g. 5%) to detect regressions before full rollout, whereas Blue-Green switches traffic completely once ready."
    },
    {
      "id": 22,
      "question": "What Linux kernel features provide the underlying isolation mechanisms for Docker containers?",
      "options": [
        "Namespaces (for process and resource isolation) and Cgroups (for CPU and memory resource limits)",
        "Cron jobs and systemd",
        "Swap memory and ext4 filesystem drivers",
        "SSH daemons and iptables rules only"
      ],
      "correctIndex": 0,
      "explanation": "Linux namespaces partition kernel resources (PID, NET, MNT, IPC), while Control Groups (cgroups) limit and isolate resource usage (CPU, RAM, I/O)."
    },
    {
      "id": 23,
      "question": "What is a Kubernetes DaemonSet typically used for in cluster operations?",
      "options": [
        "Running a copy of a background pod (such as Prometheus node-exporter or log forwarders) on every node in the cluster",
        "Running cron jobs that execute once a week",
        "Managing ingress SSL certificates across domains",
        "Terminating idle worker nodes to save cloud cost"
      ],
      "correctIndex": 0,
      "explanation": "A DaemonSet ensures that all (or some) nodes run an instance of a pod, commonly used for log collection (Fluentd) and node monitoring."
    },
    {
      "id": 24,
      "question": "How does Prometheus collect metrics from microservices in a Kubernetes cluster?",
      "options": [
        "By pulling (scraping) HTTP metrics endpoints exposed by applications on periodic intervals",
        "By continuously tailing syslog text files on worker nodes",
        "By injecting byte code into the Linux kernel",
        "By reading database write-ahead logs"
      ],
      "correctIndex": 0,
      "explanation": "Prometheus operates primarily on a pull-model: it queries HTTP endpoints (e.g., /metrics or /actuator/prometheus) configured in its scrape targets."
    },
    {
      "id": 25,
      "question": "In microservices architecture, what is the primary role of a Service Mesh (e.g. Istio, Linkerd)?",
      "options": [
        "Manages service-to-service communication with mutual TLS (mTLS) encryption, traffic routing, telemetry, and distributed tracing",
        "Stores static media assets on Amazon S3",
        "Compiles microservice code into Docker containers",
        "Generates SQL database schemas automatically"
      ],
      "correctIndex": 0,
      "explanation": "A service mesh uses sidecar proxies (Envoy) to handle cross-cutting networking concerns like mTLS, circuit breaking, retries, and telemetry transparently."
    },
    {
      "id": 26,
      "question": "In AWS IAM, what is the Principle of Least Privilege?",
      "options": [
        "Granting identities only the absolute minimum permissions strictly necessary to perform their assigned tasks",
        "Giving all developers full AdministratorAccess",
        "Using shared passwords for all servers",
        "Disabling multi-factor authentication"
      ],
      "correctIndex": 0,
      "explanation": "Least privilege minimizes damage from accidents or compromises by denying all permissions by default."
    },
    {
      "id": 27,
      "question": "In Kubernetes, what is an Ingress Controller (e.g. Ingress-Nginx)?",
      "options": [
        "A specialized Layer 7 reverse proxy that routes external HTTP/S traffic to internal cluster Services based on path and host rules",
        "A hardware router inside AWS data centers",
        "A tool for creating Dockerfiles",
        "A Kubernetes backup daemon"
      ],
      "correctIndex": 0,
      "explanation": "Ingress controllers satisfy Ingress rules, providing edge routing, SSL termination, and name-based virtual hosting."
    },
    {
      "id": 28,
      "question": "What is the purpose of GitOps using tools like ArgoCD in cloud infrastructure?",
      "options": [
        "Uses Git repositories as the single source of truth for declarative infrastructure and continuously reconciles live cluster state to match Git",
        "Sends email alerts on git pull requests",
        "Automatically creates GitHub user accounts",
        "Compiles Go applications"
      ],
      "correctIndex": 0,
      "explanation": "GitOps uses git commits to trigger automated deployment, ensuring the Kubernetes cluster matches declared repository state."
    },
    {
      "id": 29,
      "question": "What is the function of a Helm Chart in Kubernetes?",
      "options": [
        "A packaged collection of parameterized YAML templates and default values for deploying applications to Kubernetes",
        "A monitoring dashboard for container memory",
        "A network bandwidth analyzer",
        "A command line text editor"
      ],
      "correctIndex": 0,
      "explanation": "Helm is the package manager for Kubernetes, allowing reproducible version-controlled deployments using templated manifests."
    },
    {
      "id": 30,
      "question": "In distributed cloud systems, what is the role of an API Gateway (e.g. Kong, AWS API Gateway)?",
      "options": [
        "Acts as a single entry point handling cross-cutting concerns: rate limiting, authentication, SSL termination, and request routing",
        "Replaces backend databases with distributed file storage",
        "Runs unit tests on backend code",
        "Generates React user interfaces"
      ],
      "correctIndex": 0,
      "explanation": "API Gateways centralize client security, request routing, metric logging, and throttling across backend microservices."
    }
  ],
  "database": [
    {
      "id": 1,
      "question": "What does the 'A' in ACID properties of relational databases stand for?",
      "options": [
        "Atomicity",
        "Availability",
        "Authentication",
        "Asynchronous"
      ],
      "correctIndex": 0,
      "explanation": "Atomicity guarantees that all transactions either commit completely or roll back with zero partial changes."
    },
    {
      "id": 2,
      "question": "Which index data structure is standard in PostgreSQL and MySQL for equality and range query evaluations?",
      "options": [
        "B-Tree Index",
        "Hash Index",
        "GIN Index",
        "BRIN Index"
      ],
      "correctIndex": 0,
      "explanation": "B-Trees maintain sorted balanced trees allowing O(log n) lookups and ranges."
    },
    {
      "id": 3,
      "question": "Which SQL clause is used to filter aggregated group results produced by a `GROUP BY` statement?",
      "options": [
        "HAVING",
        "WHERE",
        "FILTER",
        "LIMIT"
      ],
      "correctIndex": 0,
      "explanation": "HAVING filters grouped aggregates; WHERE filters individual rows before grouping."
    },
    {
      "id": 4,
      "question": "What type of JOIN returns all records from the left table and matched records from the right table, filling nulls if no match?",
      "options": [
        "LEFT OUTER JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "RIGHT JOIN"
      ],
      "correctIndex": 0,
      "explanation": "LEFT JOIN keeps all rows from the left table regardless of matches in the right table."
    },
    {
      "id": 5,
      "question": "What is database Normalization in relational database design?",
      "options": [
        "Structuring tables to minimize data redundancy and eliminate update/delete anomalies",
        "Converting SQL to JSON",
        "Compressing database backup files",
        "Creating read-replicas"
      ],
      "correctIndex": 0,
      "explanation": "Normalization (1NF, 2NF, 3NF, BCNF) organizes relational schemas efficiently."
    },
    {
      "id": 6,
      "question": "In PostgreSQL, what keyword is used to explain the query execution plan without running expensive write commands?",
      "options": [
        "EXPLAIN",
        "ANALYZE",
        "PROFILE",
        "DEBUG"
      ],
      "correctIndex": 0,
      "explanation": "EXPLAIN outputs the execution plan selected by the planner."
    },
    {
      "id": 7,
      "question": "What is a Foreign Key constraint in a relational database?",
      "options": [
        "A field that references the Primary Key of another table to preserve referential integrity",
        "An encrypted column password",
        "A secondary index",
        "A key generated by an external API"
      ],
      "correctIndex": 0,
      "explanation": "Foreign keys prevent orphaned records and ensure cross-table consistency."
    },
    {
      "id": 8,
      "question": "What open-source in-memory key-value data store is widely used for distributed caching, sessions, and pub/sub?",
      "options": [
        "Redis",
        "PostgreSQL",
        "Elasticsearch",
        "Cassandra"
      ],
      "correctIndex": 0,
      "explanation": "Redis provides sub-millisecond in-memory data structures."
    },
    {
      "id": 9,
      "question": "What does database Sharding achieve in distributed systems?",
      "options": [
        "Horizontally partitioning rows of a dataset across multiple independent database servers",
        "Creating table backups on tape",
        "Replicating identical tables on one server",
        "Encrypting database connections"
      ],
      "correctIndex": 0,
      "explanation": "Sharding splits massive tables horizontally across nodes to distribute write/read throughput."
    },
    {
      "id": 10,
      "question": "In SQL, what is the purpose of Window Functions (e.g. `ROW_NUMBER() OVER (PARTITION BY ...)` )?",
      "options": [
        "Performs calculations across a set of table rows related to the current row without collapsing them into a single row",
        "Opens a new window in the browser",
        "Cleans cache memory",
        "Encrypts query results"
      ],
      "correctIndex": 0,
      "explanation": "Window functions compute rankings and running totals while retaining individual row detail."
    },
    {
      "id": 11,
      "question": "In relational databases, what does the 'I' in ACID stand for and what does it prevent?",
      "options": [
        "Isolation: ensures concurrent transactions execute without interfering with one another",
        "Immutability: prevents any data from being updated once inserted",
        "Indexing: mandates that all columns have B-tree indices",
        "Inheritance: allows tables to inherit columns from parent tables"
      ],
      "correctIndex": 0,
      "explanation": "Isolation guarantees that concurrently running transactions appear to execute sequentially, preventing dirty reads and conflicts."
    },
    {
      "id": 12,
      "question": "In PostgreSQL, what is a 'Phantom Read' in transaction isolation?",
      "options": [
        "When a transaction re-runs a query with a range condition and finds new rows inserted and committed by another transaction",
        "When a query reads corrupted data from damaged disk sectors",
        "When a transaction reads uncommitted changes from an aborted transaction",
        "When a query returns results from a deleted database"
      ],
      "correctIndex": 0,
      "explanation": "A phantom read occurs when a range query executed twice within a transaction returns different sets of rows due to concurrent inserts."
    },
    {
      "id": 13,
      "question": "What is the default index type in PostgreSQL and MySQL, and what is its search time complexity?",
      "options": [
        "B-Tree index, with logarithmic $O(\\log N)$ search time complexity",
        "Hash index, with linear $O(N)$ search time complexity",
        "GIN index, with constant $O(1)$ search time complexity",
        "Bitmap index, with quadratic $O(N^2)$ search time complexity"
      ],
      "correctIndex": 0,
      "explanation": "B-Tree (Balanced Tree) is the default index type in SQL databases, providing O(log N) lookup, insertion, and range scan performance."
    },
    {
      "id": 14,
      "question": "In PostgreSQL, what does a GIN (Generalized Inverted Index) excel at indexing?",
      "options": [
        "Composite items containing multiple elements, such as JSONB arrays, full-text search vectors, and array columns",
        "Single sequential integer primary keys",
        "Large binary BLOB audio files",
        "Temporary in-memory scratch tables"
      ],
      "correctIndex": 0,
      "explanation": "GIN is designed for composite values where elements need to be looked up independently, making it ideal for JSONB and tsvector."
    },
    {
      "id": 15,
      "question": "What is the key purpose of the PostgreSQL `VACUUM` process?",
      "options": [
        "Reclaims storage space occupied by dead row versions (tuples) created by UPDATE and DELETE statements",
        "Compiles stored procedures into native C code",
        "Flushes all tables to remote S3 cloud storage",
        "Restarts the database engine every midnight"
      ],
      "correctIndex": 0,
      "explanation": "Due to MVCC, updates and deletes create dead tuples; VACUUM frees up this dead space for reuse by new rows."
    },
    {
      "id": 16,
      "question": "In SQL, what is the difference between `UNION` and `UNION ALL`?",
      "options": [
        "`UNION` removes duplicate rows by performing a sorting/deduplication pass, while `UNION ALL` retains all rows and is faster",
        "`UNION ALL` only works on numbers, while `UNION` works on text",
        "`UNION` joins tables horizontally, while `UNION ALL` joins vertically",
        "`UNION ALL` requires both tables to share the same primary key"
      ],
      "correctIndex": 0,
      "explanation": "UNION ALL combines sets without checking for duplicates, making it significantly faster when duplicates are impossible or acceptable."
    },
    {
      "id": 17,
      "question": "What is a 'Covering Index' in relational database optimization?",
      "options": [
        "An index that includes all columns requested by a query, allowing the database to satisfy the query from the index alone without table heap access",
        "An index that encrypts all table data on disk",
        "An index that spans across all tables in a database",
        "An index used exclusively for full database backups"
      ],
      "correctIndex": 0,
      "explanation": "A covering index contains all queried columns (often via INCLUDE in Postgres), enabling Index-Only Scans without table page lookups."
    },
    {
      "id": 18,
      "question": "In SQL window functions, how does `DENSE_RANK()` differ from `RANK()` when there are duplicate values?",
      "options": [
        "`DENSE_RANK()` leaves no gaps in the ranking sequence (1, 1, 2, 3), whereas `RANK()` skips ranks (1, 1, 3, 4)",
        "`DENSE_RANK()` sorts rows in reverse order",
        "`RANK()` only works on integer columns",
        "`DENSE_RANK()` requires an in-memory Redis cluster"
      ],
      "correctIndex": 0,
      "explanation": "RANK() produces gaps in ranking after ties (e.g. 1, 1, 3), whereas DENSE_RANK() always assigns contiguous integers (1, 1, 2)."
    },
    {
      "id": 19,
      "question": "What is Write-Ahead Logging (WAL) in PostgreSQL?",
      "options": [
        "A durability mechanism where changes are written to an append-only log on disk before being applied to data pages",
        "A system for logging user passwords to disk",
        "An automated query plan generator",
        "A protocol for compressing HTTP network requests"
      ],
      "correctIndex": 0,
      "explanation": "WAL guarantees durability: even if the server crashes before dirty data pages are flushed, the transaction can be replayed from the WAL log."
    },
    {
      "id": 20,
      "question": "In Redis caching, what does the 'Cache Stampede' (Thundering Herd) phenomenon refer to?",
      "options": [
        "When a popular cached key expires, and thousands of concurrent requests simultaneously hit the database to recompute it",
        "When Redis runs out of network bandwidth",
        "When duplicate keys overwrite each other",
        "When Redis server restarts unexpectedly"
      ],
      "correctIndex": 0,
      "explanation": "A cache stampede occurs when a high-traffic cache key expires, causing massive concurrent load on the underlying database."
    },
    {
      "id": 21,
      "question": "In PostgreSQL, what is the difference between a clustered index and an unclustered index?",
      "options": [
        "A clustered index dictates the physical sorting order of table rows on disk to match the index order",
        "Clustered indexes are stored in cloud S3",
        "Unclustered indexes cannot be used for WHERE clauses",
        "They perform identically"
      ],
      "correctIndex": 0,
      "explanation": "CLUSTER sorts the physical table pages according to an index, speeding up range queries on that column."
    },
    {
      "id": 22,
      "question": "What is Database Sharding?",
      "options": [
        "Horizontal partitioning of database rows across multiple independent physical database instances",
        "Splitting table columns into smaller tables",
        "Backing up databases to tape drives",
        "Encrypting database connections"
      ],
      "correctIndex": 0,
      "explanation": "Sharding distributes data horizontally across multiple database servers to scale beyond the CPU and storage limits of a single machine."
    },
    {
      "id": 23,
      "question": "What does `COALESCE(val1, val2, val3)` return in standard SQL?",
      "options": [
        "The first non-NULL expression from its argument list",
        "The sum of all three values",
        "The average of all values",
        "The alphabetical minimum"
      ],
      "correctIndex": 0,
      "explanation": "COALESCE evaluates arguments in sequence and returns the first value that is not NULL."
    },
    {
      "id": 24,
      "question": "What is an SQL Common Table Expression (CTE) defined with `WITH`?",
      "options": [
        "A named temporary result set defined within the scope of a single SELECT, INSERT, UPDATE, or DELETE statement",
        "A permanent table saved to disk",
        "A database user account",
        "A database index type"
      ],
      "correctIndex": 0,
      "explanation": "CTEs provide readable, modular temporary result sets, and with WITH RECURSIVE can traverse hierarchical tree structures."
    },
    {
      "id": 25,
      "question": "In Redis, what is the time complexity of the `O(1)` `HGET` command?",
      "options": [
        "Constant time $O(1)$ lookup for a specific field inside a hash",
        "Linear time $O(N)$",
        "Logarithmic $O(\\log N)$",
        "Exponential $O(2^N)$"
      ],
      "correctIndex": 0,
      "explanation": "Redis hashes provide O(1) field retrieval regardless of how many fields are stored."
    }
  ],
  "cybersecurity": [
    {
      "id": 1,
      "question": "What security model operates on the principle of 'Never trust, always verify' regardless of user perimeter location?",
      "options": [
        "Zero-Trust Architecture",
        "Defense in Depth",
        "DMZ Firewalls",
        "VPN Perimeter"
      ],
      "correctIndex": 0,
      "explanation": "Zero-Trust assumes threats exist both inside and outside network boundaries at all times."
    },
    {
      "id": 2,
      "question": "What cryptographic algorithm is an asymmetric public-key cryptosystem used for TLS certificates and digital signatures?",
      "options": [
        "RSA / ECC (Elliptic Curve Cryptography)",
        "AES-256",
        "DES",
        "RC4"
      ],
      "correctIndex": 0,
      "explanation": "RSA and ECC use public/private key pairs for asymmetric encryption and verification."
    },
    {
      "id": 3,
      "question": "Which symmetric encryption standard is approved worldwide for encrypting sensitive data at rest with 256-bit keys?",
      "options": [
        "AES (Advanced Encryption Standard)",
        "MD5",
        "SHA-1",
        "Base64"
      ],
      "correctIndex": 0,
      "explanation": "AES-256 is the gold standard for symmetric block encryption."
    },
    {
      "id": 4,
      "question": "What is a Cross-Site Scripting (XSS) attack?",
      "options": [
        "Injecting malicious client-side JavaScript scripts into trusted web pages viewed by other users",
        "Flooding servers with TCP SYN packets",
        "Guessing passwords via dictionary attacks",
        "Sniffing unencrypted Wi-Fi packets"
      ],
      "correctIndex": 0,
      "explanation": "XSS executes untrusted attacker code in victim browser contexts to hijack sessions or steal cookies."
    },
    {
      "id": 5,
      "question": "What header token is used to prevent Cross-Site Request Forgery (CSRF) in state-changing web requests?",
      "options": [
        "CSRF Anti-Forgery Token",
        "JWT Bearer Token",
        "SSL Public Key",
        "API Gateway Key"
      ],
      "correctIndex": 0,
      "explanation": "CSRF tokens validate that requests originate intentionally from the authentic frontend client."
    },
    {
      "id": 6,
      "question": "In penetration testing, what is the term for identifying security vulnerabilities before malicious actors exploit them?",
      "options": [
        "Ethical Hacking / White-Hat Assessment",
        "Format drive command",
        "Compress server logs",
        "DDoS stress testing"
      ],
      "correctIndex": 0,
      "explanation": "Ethical penetration testing discovers, documents, and remediates security weaknesses."
    },
    {
      "id": 7,
      "question": "What hashing algorithm is designed specifically for password hashing with adaptive salt and cost factors?",
      "options": [
        "Bcrypt / Argon2",
        "MD5",
        "SHA-256",
        "CRC32"
      ],
      "correctIndex": 0,
      "explanation": "Bcrypt and Argon2 are slow, memory-hard algorithms resistant to GPU brute-force attacks."
    },
    {
      "id": 8,
      "question": "What does the principle of least privilege dictate?",
      "options": [
        "Users, accounts, and processes should be granted only the minimum permissions necessary to perform their legitimate tasks",
        "Every user is granted admin access",
        "Passwords must be 4 characters",
        "Disable all firewalls"
      ],
      "correctIndex": 0,
      "explanation": "Least privilege minimizes damage from accidental misconfigurations or compromised credentials."
    },
    {
      "id": 9,
      "question": "What security protocol encrypts HTTP traffic across the internet using TLS?",
      "options": [
        "HTTPS",
        "FTP",
        "Telnet",
        "SNMP"
      ],
      "correctIndex": 0,
      "explanation": "HTTPS encrypts communications using Transport Layer Security."
    },
    {
      "id": 10,
      "question": "What is a Man-in-the-Middle (MITM) attack?",
      "options": [
        "An attacker secretly intercepts and potentially alters communications between two parties who believe they are communicating directly",
        "A hacker breaking into a server room",
        "A hardware keyboard keylogger",
        "A brute force script"
      ],
      "correctIndex": 0,
      "explanation": "MITM attacks intercept and decrypt/tamper with network payloads in transit."
    },
    {
      "id": 11,
      "question": "In OAuth 2.0, why is PKCE (Proof Key for Code Exchange) mandatory for Single Page Apps (SPAs) and mobile applications?",
      "options": [
        "Because public clients cannot safely store a client secret, and PKCE prevents authorization code interception and injection attacks",
        "Because PKCE encrypts the entire database with AES-GCM",
        "Because PKCE eliminates the need for user passwords",
        "Because PKCE replaces HTTPS with quantum key distribution"
      ],
      "correctIndex": 0,
      "explanation": "Public clients (mobile apps, SPAs) cannot keep client secrets confidential. PKCE uses dynamically generated code verifiers and challenges to authenticate the token request."
    },
    {
      "id": 12,
      "question": "What does a Content Security Policy (CSP) HTTP header primarily protect against?",
      "options": [
        "Cross-Site Scripting (XSS) and data injection attacks by restricting the origins from which scripts, styles, and media can be loaded",
        "DDoS attacks on the network layer",
        "SQL injection in backend relational databases",
        "Hard drive corruption on the web server"
      ],
      "correctIndex": 0,
      "explanation": "CSP restricts authorized sources of executable scripts, preventing attackers from injecting and running unauthorized malicious inline scripts."
    },
    {
      "id": 13,
      "question": "Why is the `SameSite=Strict` attribute on authentication cookies effective against Cross-Site Request Forgery (CSRF)?",
      "options": [
        "Prevents the browser from sending the cookie with any cross-site request, ensuring cookies are only attached when requests originate from the same domain",
        "Encrypts cookie contents using RSA-4096",
        "Deletes the cookie whenever the user closes the browser tab",
        "Forces the user to re-enter their password on every click"
      ],
      "correctIndex": 0,
      "explanation": "SameSite=Strict ensures cookies are never sent in third-party navigation or cross-site form POSTs, blocking CSRF attacks at the browser level."
    },
    {
      "id": 14,
      "question": "Why are cryptographic password hashing algorithms like Argon2id or bcrypt used instead of standard cryptographic hashes like SHA-256?",
      "options": [
        "They are computationally expensive and memory-hard with configurable work factors (cost), rendering GPU/ASIC brute-force attacks impractical",
        "SHA-256 cannot hash strings longer than 32 characters",
        "Argon2id and bcrypt can be reversed back into plain text passwords",
        "SHA-256 produces variable-length output"
      ],
      "correctIndex": 0,
      "explanation": "Fast hashes like SHA-256 can be tested billions of times per second on GPUs. Slow, memory-hard algorithms like Argon2id protect passwords against cracking."
    },
    {
      "id": 15,
      "question": "What is an Insecure Direct Object Reference (IDOR) vulnerability?",
      "options": [
        "When an application exposes a reference to internal database objects (e.g. `/api/documents/1054`) without verifying user authorization permissions",
        "When a website uses HTTP instead of HTTPS",
        "When a user forgets their password",
        "When an SQL table is missing a foreign key constraint"
      ],
      "correctIndex": 0,
      "explanation": "IDOR occurs when an application provides direct access to objects based on user-supplied input without performing ownership or access-control verification."
    },
    {
      "id": 16,
      "question": "In TLS 1.3, what is 'Forward Secrecy' (Perfect Forward Secrecy - PFS)?",
      "options": [
        "Ensures past recorded session communications cannot be decrypted even if the server's long-term private key is compromised in the future",
        "Guarantees that network packets will never be dropped",
        "Allows servers to predict user traffic before it occurs",
        "Prevents denial of service attacks automatically"
      ],
      "correctIndex": 0,
      "explanation": "PFS uses ephemeral Diffie-Hellman key exchanges for each session. If the server's private key is later stolen, past session keys remain unrecoverable."
    },
    {
      "id": 17,
      "question": "What is a Server-Side Request Forgery (SSRF) attack and what is its primary target in cloud environments?",
      "options": [
        "An attacker coerces the server into making unintended HTTP requests, often targeting the cloud instance metadata service (`http://169.254.169.254`) to steal IAM credentials",
        "An attacker floods the user's browser with pop-up advertisements",
        "An attacker modifies client-side JavaScript bundle files",
        "An attacker brute-forces SSH port 22"
      ],
      "correctIndex": 0,
      "explanation": "SSRF tricks backend servers into querying internal networks or cloud metadata APIs (169.254.169.254) to exfiltrate temporary cloud access keys."
    },
    {
      "id": 18,
      "question": "In Zero Trust Architecture, what is the core operational principle?",
      "options": [
        "'Never Trust, Always Verify': every user, device, and network transaction must be continuously authenticated and authorized regardless of perimeter location",
        "Firewalls alone provide complete internal network security",
        "Only external public internet traffic needs to be inspected",
        "Trust all requests originating from within the corporate office Wi-Fi"
      ],
      "correctIndex": 0,
      "explanation": "Zero Trust assumes breaches are inevitable. It removes implicit trust based on network location, verifying identity and policy on every request."
    },
    {
      "id": 19,
      "question": "What is the critical risk associated with using the `none` algorithm in JWT (JSON Web Tokens)?",
      "options": [
        "Attackers can forge arbitrary administrative tokens by stripping the signature and setting algorithm to `none`, which vulnerable parsers accept without verification",
        "It slows down JSON parsing by 500%",
        "It causes token strings to exceed the 2KB URL limit",
        "It deletes the user account upon sign-out"
      ],
      "correctIndex": 0,
      "explanation": "Some insecure JWT libraries accept unsigned tokens with alg: 'none', allowing malicious users to forge valid administrator claims."
    },
    {
      "id": 20,
      "question": "What is the security purpose of adding a random cryptographic salt before hashing a password?",
      "options": [
        "Ensures identical passwords produce distinct hash values, preventing precomputed Rainbow Table and dictionary lookup attacks",
        "Compresses the password into a shorter hash string",
        "Allows passwords to be decrypted by system administrators",
        "Verifies that the password contains numbers and special symbols"
      ],
      "correctIndex": 0,
      "explanation": "Salting guarantees uniqueness: even if two users choose the same password, their unique random salts produce completely different hashes."
    },
    {
      "id": 21,
      "question": "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
      "options": [
        "When an application accesses data objects using user-supplied IDs directly without validating that the requester owns that object",
        "When a database lacks primary keys",
        "When a website lacks an SSL certificate",
        "When passwords contain fewer than 8 characters"
      ],
      "correctIndex": 0,
      "explanation": "IDOR allows attackers to view or modify other users' sensitive records simply by changing URL IDs (e.g. /account?id=502)."
    },
    {
      "id": 22,
      "question": "What does HTTP Strict Transport Security (HSTS) enforce?",
      "options": [
        "Instructs browsers to interact with the domain exclusively over secure HTTPS connections, preventing SSL-stripping attacks",
        "Blocks all user cookies",
        "Disables JavaScript in the browser",
        "Enforces two-factor authentication on every page"
      ],
      "correctIndex": 0,
      "explanation": "HSTS header tells browsers to automatically convert all HTTP links to HTTPS and refuse invalid SSL certificates."
    },
    {
      "id": 23,
      "question": "In cryptography, what is the key difference between Symmetric and Asymmetric encryption?",
      "options": [
        "Symmetric encryption uses the same shared key for encryption and decryption; Asymmetric uses a public key to encrypt and a private key to decrypt",
        "Symmetric encryption is 1000x slower than Asymmetric",
        "Asymmetric encryption cannot encrypt text",
        "Symmetric encryption does not use keys"
      ],
      "correctIndex": 0,
      "explanation": "Symmetric (AES) uses one key and is ultra-fast; Asymmetric (RSA/ECC) uses keypairs and is used for key exchanges and digital signatures."
    },
    {
      "id": 24,
      "question": "How does a Replay Attack operate and how is it mitigated in secure API design?",
      "options": [
        "An attacker intercepts valid transmission data and re-transmits it; mitigated using one-time nonces and short-lived timestamped signatures",
        "An attacker types passwords repeatedly until correct",
        "An attacker creates duplicate user accounts",
        "An attacker restarts the web server"
      ],
      "correctIndex": 0,
      "explanation": "Nonces (numbers used once) and timestamp expirations ensure an intercepted message cannot be re-sent to duplicate actions."
    },
    {
      "id": 25,
      "question": "What is a Denial of Service (DoS) attack using SYN Flooding?",
      "options": [
        "Floods a server with TCP SYN packets without completing the 3-way handshake, exhausting the server's connection backlog queue",
        "Encrypts the server's hard drive and demands ransom",
        "Steals credit card numbers from database tables",
        "Injects malicious SQL commands"
      ],
      "correctIndex": 0,
      "explanation": "SYN flood exploits the TCP 3-way handshake by leaving half-open connections until the server runs out of connection resources."
    }
  ],
  "dsa": [
    {
      "id": 1,
      "question": "Which data structure operates on a Last-In, First-Out (LIFO) access pattern?",
      "options": [
        "Stack",
        "Queue",
        "Binary Tree",
        "Linked List"
      ],
      "correctIndex": 0,
      "explanation": "Stacks push and pop elements from the top following LIFO ordering."
    },
    {
      "id": 2,
      "question": "What is the worst-case time complexity of searching an element in an unbalanced Binary Search Tree (BST)?",
      "options": [
        "O(n) - degenerates into a linear linked list",
        "O(log n)",
        "O(1)",
        "O(n log n)"
      ],
      "correctIndex": 0,
      "explanation": "An unbalanced BST can degenerate into a single chain of nodes with O(n) traversal."
    },
    {
      "id": 3,
      "question": "Which graph traversal algorithm uses a FIFO Queue to visit neighbor nodes level-by-level?",
      "options": [
        "Breadth-First Search (BFS)",
        "Depth-First Search (DFS)",
        "Dijkstra's Algorithm",
        "Bellman-Ford"
      ],
      "correctIndex": 0,
      "explanation": "BFS explores level by level using a queue to find shortest paths in unweighted graphs."
    },
    {
      "id": 4,
      "question": "Which algorithmic design technique solves problems by breaking them into overlapping subproblems and memoizing results?",
      "options": [
        "Dynamic Programming (DP)",
        "Greedy Heuristics",
        "Divide and Conquer",
        "Backtracking"
      ],
      "correctIndex": 0,
      "explanation": "Dynamic programming avoids redundant computation by caching solutions to subproblems."
    },
    {
      "id": 5,
      "question": "What is the average time complexity of finding the Minimum element in a Min-Heap priority queue?",
      "options": [
        "O(1) - root of heap",
        "O(log n)",
        "O(n)",
        "O(n^2)"
      ],
      "correctIndex": 0,
      "explanation": "The minimum element in a Min-Heap is always stored at index 0 (the root)."
    },
    {
      "id": 6,
      "question": "Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n) and is stable?",
      "options": [
        "MergeSort",
        "QuickSort",
        "HeapSort",
        "InsertionSort"
      ],
      "correctIndex": 0,
      "explanation": "MergeSort recursively divides arrays and merges in linear time, guaranteeing O(n log n)."
    },
    {
      "id": 7,
      "question": "What algorithm finds the shortest path between nodes in a weighted graph with non-negative edge weights?",
      "options": [
        "Dijkstra's Algorithm",
        "Kruskal's Algorithm",
        "Floyd-Warshall",
        "Tarjan's SCC"
      ],
      "correctIndex": 0,
      "explanation": "Dijkstra uses a priority queue to greedily expand lowest-cost paths."
    },
    {
      "id": 8,
      "question": "What data structure is optimal for autocomplete word lookups and prefix searching?",
      "options": [
        "Trie (Prefix Tree)",
        "Hash Table",
        "Binary Search Tree",
        "Disjoint Set (Union-Find)"
      ],
      "correctIndex": 0,
      "explanation": "Tries store characters in path edges allowing O(L) prefix searches where L is word length."
    },
    {
      "id": 9,
      "question": "What is the time complexity of binary search on a sorted array of size n?",
      "options": [
        "O(log n)",
        "O(1)",
        "O(n)",
        "O(n log n)"
      ],
      "correctIndex": 0,
      "explanation": "Binary search halves the search space at each iteration."
    },
    {
      "id": 10,
      "question": "Which algorithm finds the Minimum Spanning Tree of a connected undirected graph using edge sorting and Union-Find?",
      "options": [
        "Kruskal's Algorithm",
        "Prim's Algorithm",
        "Dijkstra's Algorithm",
        "Topological Sort"
      ],
      "correctIndex": 0,
      "explanation": "Kruskal sorts edges by weight and unifies disjoint sets without forming cycles."
    },
    {
      "id": 11,
      "question": "What is the worst-case time complexity of an unbalanced Binary Search Tree (BST) versus an AVL Tree for search operations?",
      "options": [
        "Unbalanced BST: $O(N)$ when skewed into a linked list; AVL Tree: guaranteed $O(\\log N)$ due to strict height balancing",
        "Both trees guarantee $O(1)$ constant time lookup",
        "Unbalanced BST is $O(\\log N)$, AVL tree is $O(N^2)$",
        "AVL trees have $O(N)$ time complexity for search"
      ],
      "correctIndex": 0,
      "explanation": "A skewed BST degrades to a linked list with O(N) operations. AVL trees enforce a balance factor of |hL - hR| <= 1, guaranteeing O(log N)."
    },
    {
      "id": 12,
      "question": "How does Dijkstra's Algorithm find the shortest path in a weighted graph, and what constraint does it require?",
      "options": [
        "Greedy approach using a min-priority queue with $O((V + E) \\log V)$ complexity; requires that all edge weights are non-negative",
        "Dynamic programming; handles negative weight cycles",
        "Random walk approach; works only on tree structures",
        "Brute-force depth-first traversal with $O(V!)$ complexity"
      ],
      "correctIndex": 0,
      "explanation": "Dijkstra greedily expands the shortest known distance using a min-heap, but fails if edge weights are negative (which requires Bellman-Ford)."
    },
    {
      "id": 13,
      "question": "In topological sorting of a Directed Acyclic Graph (DAG), what does Kahn's algorithm use to identify starting nodes?",
      "options": [
        "Tracks the in-degree of all vertices and processes nodes with an in-degree of 0 via a queue",
        "Sorts vertices by their alphabetical labels",
        "Performs binary search on graph edges",
        "Counts the number of leaf nodes in the tree"
      ],
      "correctIndex": 0,
      "explanation": "Kahn's algorithm repeatedly removes vertices with in-degree 0 (no dependencies) and decrements the in-degrees of their neighbor vertices."
    },
    {
      "id": 14,
      "question": "What is the amortized time complexity of Union-Find (Disjoint Set Union) when both Path Compression and Union by Rank are used?",
      "options": [
        "Nearly linear $O(\\alpha(N))$, where $\\alpha$ is the inverse Ackermann function (effectively constant $\\le 4$ for all practical universe sizes)",
        "Quadratic $O(N^2)$",
        "Strict logarithmic $O(\\log^2 N)$",
        "Exponential $O(2^N)$"
      ],
      "correctIndex": 0,
      "explanation": "Path compression flattens tree depth and union by rank keeps trees shallow, yielding an amortized time per operation of O(alpha(N)) <= 4."
    },
    {
      "id": 15,
      "question": "In algorithm design, what is Kadane's Algorithm used for and what are its time and space complexities?",
      "options": [
        "Maximum Subarray Sum problem; solves in $O(N)$ linear time and $O(1)$ constant auxiliary space",
        "Sorting integers in $O(N \\log N)$ time and $O(N)$ space",
        "Finding shortest path in graphs in $O(V \\cdot E)$ time",
        "Matrix multiplication in $O(N^{2.81})$ time"
      ],
      "correctIndex": 0,
      "explanation": "Kadane's algorithm maintains the maximum subarray sum ending at each position, achieving optimal O(N) time and O(1) space."
    },
    {
      "id": 16,
      "question": "How is an LRU (Least Recently Used) Cache implemented with $O(1)$ constant time for both `get` and `put` operations?",
      "options": [
        "Combining a Hash Map (for $O(1)$ key-to-node lookup) with a Doubly Linked List (for $O(1)$ node removal and head insertion)",
        "Using a single binary search tree with rotations",
        "Using a circular array sorted by access timestamps",
        "Using a Min-Heap re-heapified on every read"
      ],
      "correctIndex": 0,
      "explanation": "A hash map provides O(1) key access, and a doubly linked list allows moving accessed nodes to the front or evicting the tail in O(1) time."
    },
    {
      "id": 17,
      "question": "In string searching, how does the Knuth-Morris-Pratt (KMP) algorithm achieve $O(N + M)$ worst-case matching time?",
      "options": [
        "Precomputes a Longest Prefix Suffix (LPS) \u03c0-array to avoid backtracking the main text pointer when character mismatches occur",
        "Uses a rolling polynomial hash modulo a large prime",
        "Converts the search text to base64 encoding",
        "Sorts all characters alphabetically prior to matching"
      ],
      "correctIndex": 0,
      "explanation": "KMP precomputes the LPS array of the pattern so that on mismatch, it shifts the pattern pointer to the next valid prefix without resetting the text pointer."
    },
    {
      "id": 18,
      "question": "What is the difference between Memoization and Tabulation in Dynamic Programming?",
      "options": [
        "Memoization is top-down (recursive with cache); Tabulation is bottom-up (iterative filling of table from base cases)",
        "Memoization only applies to graphs; Tabulation applies to arrays",
        "Tabulation has higher asymptotic time complexity than Memoization",
        "Memoization does not use additional memory"
      ],
      "correctIndex": 0,
      "explanation": "Memoization solves subproblems on demand starting from the top. Tabulation solves smaller base subproblems first, avoiding recursion stack overhead."
    },
    {
      "id": 19,
      "question": "What does the expression `(n & (n - 1)) == 0` check in bit manipulation (for $n > 0$)?",
      "options": [
        "Determines whether the integer $n$ is an exact power of two ($2^k$)",
        "Checks if $n$ is an odd number",
        "Reverses all bits in the integer",
        "Divides $n$ by two with round-up"
      ],
      "correctIndex": 0,
      "explanation": "Powers of two have exactly one bit set (e.g. 8 is 1000). Subtracting 1 flips all bits up to the lowest set bit (7 is 0111). Their AND is 0."
    },
    {
      "id": 20,
      "question": "What is the primary advantage of a Trie (Prefix Tree) over a Hash Map for auto-complete search dictionaries?",
      "options": [
        "Efficiently finds all words sharing a common prefix in $O(P + K)$ time, whereas Hash Maps require scanning all keys in $O(N)$",
        "Tries use less memory than any other data structure",
        "Tries support floating-point numbers natively",
        "Tries automatically balance their height"
      ],
      "correctIndex": 0,
      "explanation": "Tries group common prefixes along shared branch paths, allowing instant retrieval of all autocomplete suggestions starting with prefix P."
    },
    {
      "id": 21,
      "question": "What is the time complexity of building a Binary Heap from an unordered array of $N$ elements (heapify)?",
      "options": [
        "$O(N)$ linear time complexity",
        "$O(N \\log N)$",
        "$O(N^2)$",
        "$O(\\log N)$"
      ],
      "correctIndex": 0,
      "explanation": "Bottom-up heapify runs in mathematical linear O(N) time because nodes near the leaves have very short swap distances."
    },
    {
      "id": 22,
      "question": "In tree traversal, which traversal of a Binary Search Tree (BST) produces nodes in strictly ascending sorted order?",
      "options": [
        "In-Order Traversal (Left -> Root -> Right)",
        "Pre-Order Traversal (Root -> Left -> Right)",
        "Post-Order Traversal (Left -> Right -> Root)",
        "Level-Order Traversal"
      ],
      "correctIndex": 0,
      "explanation": "In-order traversal visits left subtree (smaller), then root, then right subtree (larger), outputting elements in sorted order."
    },
    {
      "id": 23,
      "question": "What is the time complexity of Breadth-First Search (BFS) on a graph with $V$ vertices and $E$ edges using an adjacency list?",
      "options": [
        "$O(V + E)$",
        "$O(V \\cdot E)$",
        "$O(V^2)$",
        "$O(\\log V)$"
      ],
      "correctIndex": 0,
      "explanation": "BFS visits every vertex once and inspects every edge once, yielding O(V + E) linear graph traversal time."
    },
    {
      "id": 24,
      "question": "What data structure is used to implement a Monotonic Queue for solving the Sliding Window Maximum problem in $O(N)$ time?",
      "options": [
        "A Doubly-Ended Queue (`Deque`) that maintains indices in strictly decreasing order of their values",
        "A standard FIFO Queue",
        "A binary search tree",
        "A singly linked list"
      ],
      "correctIndex": 0,
      "explanation": "A monotonic deque discards elements smaller than the incoming candidate, guaranteeing the maximum is always at the front in amortized O(1)."
    },
    {
      "id": 25,
      "question": "In algorithm analysis, what does $O(1)$ auxiliary space complexity mean?",
      "options": [
        "The algorithm requires a constant amount of additional memory independent of the input size $N$",
        "The algorithm consumes 1 megabyte of RAM",
        "The algorithm cannot use any variables",
        "The algorithm stores all data on disk"
      ],
      "correctIndex": 0,
      "explanation": "O(1) auxiliary space means memory overhead does not grow as input scale increases (in-place operation)."
    }
  ],
  "blockchain": [
    {
      "id": 1,
      "question": "What execution environment runs smart contracts on the Ethereum blockchain network?",
      "options": [
        "Ethereum Virtual Machine (EVM)",
        "Node.js V8 Runtime",
        "Docker Sandbox",
        "Wasm Container"
      ],
      "correctIndex": 0,
      "explanation": "The EVM is the quasi-Turing complete state machine that executes Ethereum bytecode."
    },
    {
      "id": 2,
      "question": "Which vulnerability was famously exploited in The DAO hack, allowing re-entering withdraw before balance update?",
      "options": [
        "Reentrancy Attack",
        "Integer Underflow",
        "Front-Running",
        "Flash Loan Default"
      ],
      "correctIndex": 0,
      "explanation": "Reentrancy occurs when external calls execute fallback functions that re-enter state-modifying logic."
    },
    {
      "id": 3,
      "question": "What is the purpose of Gas fees in Ethereum transactions?",
      "options": [
        "Compensates validators for compute/storage costs and prevents infinite loops (Halting Problem)",
        "Encrypts user wallet keys",
        "Pays network marketing teams",
        "Backs fiat reserves"
      ],
      "correctIndex": 0,
      "explanation": "Gas prices computation resources and bounds execution steps to prevent infinite loop exploits."
    },
    {
      "id": 4,
      "question": "Which token standard defines Non-Fungible Tokens (NFTs) with distinct token IDs on EVM blockchains?",
      "options": [
        "ERC-721",
        "ERC-20",
        "ERC-1155",
        "ERC-777"
      ],
      "correctIndex": 0,
      "explanation": "ERC-721 defines unique, indivisible asset ownership on Ethereum."
    },
    {
      "id": 5,
      "question": "What consensus mechanism replaced Proof-of-Work in Ethereum during The Merge?",
      "options": [
        "Proof-of-Stake (PoS)",
        "Delegated PoS",
        "Proof-of-Authority",
        "Byzantine Agreement"
      ],
      "correctIndex": 0,
      "explanation": "Ethereum uses Proof-of-Stake where validators stake 32 ETH to propose and attest blocks."
    },
    {
      "id": 6,
      "question": "In Solidity, which function visibility modifier allows execution only from external transactions or callers?",
      "options": [
        "external",
        "public",
        "internal",
        "private"
      ],
      "correctIndex": 0,
      "explanation": "external functions can only be called from outside the contract, saving gas on large calldata arrays."
    },
    {
      "id": 7,
      "question": "What cryptographic data structure enables efficient, secure verification of transaction inclusion in blocks?",
      "options": [
        "Merkle Tree (Hash Tree)",
        "Binary Search Tree",
        "Linked List",
        "Circular Queue"
      ],
      "correctIndex": 0,
      "explanation": "Merkle roots allow cryptographic SPV proofs with O(log n) hash verification."
    },
    {
      "id": 8,
      "question": "What does contract immutability mean after deployment on a public blockchain?",
      "options": [
        "Smart contract bytecode cannot be edited or tampered with once mined on-chain",
        "Contracts expire in 30 days",
        "Developers can edit bytecode with admin keys",
        "Contracts update nightly automatically"
      ],
      "correctIndex": 0,
      "explanation": "Once deployed, bytecode is permanently fixed unless an explicit proxy architecture was engineered."
    },
    {
      "id": 9,
      "question": "Which secure coding pattern updates contract state variables before invoking external calls to external addresses?",
      "options": [
        "Checks-Effects-Interactions Pattern",
        "Singleton Pattern",
        "Factory Pattern",
        "Observer Pattern"
      ],
      "correctIndex": 0,
      "explanation": "Checks-Effects-Interactions strictly prevents reentrancy vulnerability exploits."
    },
    {
      "id": 10,
      "question": "What are Events in Solidity smart contracts used for?",
      "options": [
        "Emitting indexed log data stored in lightweight blockchain transaction receipts for indexing by dApps",
        "Scheduling cron jobs",
        "Making external HTTP requests",
        "Encrypting wallet passwords"
      ],
      "correctIndex": 0,
      "explanation": "Solidity events write topics to receipt logs monitored by web3 frontends and indexers."
    },
    {
      "id": 11,
      "question": "In Ethereum smart contract development, what is the Checks-Effects-Interactions pattern designed to prevent?",
      "options": [
        "Reentrancy attacks, by updating state variables BEFORE making external ether or contract calls",
        "Integer underflow and overflow",
        "Compiler out-of-memory errors",
        "Gas price fluctuations in the mempool"
      ],
      "correctIndex": 0,
      "explanation": "Checks-Effects-Interactions validates conditions first, updates internal state second, and only interacts with external contracts last, preventing reentrancy."
    },
    {
      "id": 12,
      "question": "In Solidity, why is passing read-only arrays as `calldata` more gas-efficient than `memory`?",
      "options": [
        "`calldata` is an immutable, non-allocatable chunk of transaction input data that avoids expensive memory allocation and copy opcodes",
        "`calldata` encrypts the array parameters",
        "`memory` variables are permanently saved to Ethereum blockchain storage",
        "`calldata` bypasses EVM gas measurement"
      ],
      "correctIndex": 0,
      "explanation": "calldata points directly to the transaction payload without copying data to memory, saving substantial gas on external function calls."
    },
    {
      "id": 13,
      "question": "What is the primary mechanism of EIP-1559 in Ethereum transaction pricing?",
      "options": [
        "Splits transaction fee into a network-determined Base Fee (which is burned, creating deflationary pressure) and an optional Priority Fee / Tip to the validator",
        "Eliminates transaction fees completely for smart contract transfers",
        "Replaces ETH currency with Polygon MATIC",
        "Caps the maximum number of transactions per block to 100"
      ],
      "correctIndex": 0,
      "explanation": "EIP-1559 dynamically adjusts the Base Fee per block and burns it, making fee estimation predictable and burning ETH when usage is high."
    },
    {
      "id": 14,
      "question": "In Layer 2 scaling, what is the key difference between Optimistic Rollups and Zero-Knowledge (ZK) Rollups?",
      "options": [
        "Optimistic rollups assume transactions are valid and rely on a 7-day fraud-proof challenge window; ZK rollups use cryptographic validity proofs (SNARKs/STARKs) for instant mathematical finality",
        "Optimistic rollups are private; ZK rollups are public",
        "ZK rollups do not execute EVM smart contracts",
        "Optimistic rollups settle on Bitcoin, ZK rollups on Solana"
      ],
      "correctIndex": 0,
      "explanation": "Optimistic rollups require a challenge delay (fraud proofs) for withdrawals; ZK rollups provide mathematical validity proofs verified on L1 immediately."
    },
    {
      "id": 15,
      "question": "What is ERC-4337 Account Abstraction in modern Web3 architecture?",
      "options": [
        "Enables smart contract wallets with programmable logic (social recovery, gasless transactions, batched calls) without altering Ethereum's core consensus layer",
        "Eliminates the requirement for blockchain validators",
        "Allows Bitcoin to be stored inside Ethereum accounts",
        "Converts ERC-20 tokens into non-fungible tokens"
      ],
      "correctIndex": 0,
      "explanation": "ERC-4337 introduces UserOperations and Paymasters, giving users programmable smart wallets with custom signature verification and sponsor-paid gas."
    },
    {
      "id": 16,
      "question": "What is the purpose of a Chainlink Decentralized Oracle Network (DON)?",
      "options": [
        "Supplies smart contracts with secure, tamper-resistant real-world off-chain data (asset prices, weather, verifiable random numbers) without single points of failure",
        "Mines new Ethereum blocks when network traffic spikes",
        "Stores private keys in hardware cold storage",
        "Translates Solidity bytecode into JavaScript"
      ],
      "correctIndex": 0,
      "explanation": "Smart contracts cannot make external HTTP requests. Decentralized oracles aggregate and deliver external data on-chain with cryptographic consensus."
    },
    {
      "id": 17,
      "question": "Why is Polygon zkEVM particularly compelling for Ethereum enterprise scaling?",
      "options": [
        "Provides bytecode-level EVM equivalence with Ethereum while generating ZK validity proofs that inherit Ethereum Layer 1 security at fractional transaction costs",
        "Runs on centralized AWS servers without blockchain nodes",
        "Requires developers to write smart contracts in Rust instead of Solidity",
        "Limits wallet balances to 1,000 tokens maximum"
      ],
      "correctIndex": 0,
      "explanation": "Polygon zkEVM allows developers to deploy standard unmodified Solidity contracts with existing tools (Hardhat, Foundry) while benefiting from ZK-rollup scaling."
    },
    {
      "id": 18,
      "question": "In Solidity, what is the gas saving benefit of using Custom Errors (`error Unauthorized(); revert Unauthorized();`) instead of `require(condition, \"Unauthorized\");`?",
      "options": [
        "Custom errors encode as a 4-byte selector without storing expensive error message strings in runtime bytecode",
        "Custom errors bypass all EVM gas metering",
        "Custom errors allow failed transactions to write to storage",
        "Custom errors eliminate need for unit tests"
      ],
      "correctIndex": 0,
      "explanation": "Strings in require statements incur gas for storage and ABI encoding. Custom errors are encoded as 4-byte selectors (Keccak-256 hash), saving gas on deployment and reverts."
    },
    {
      "id": 19,
      "question": "What is a Flash Loan in decentralized finance (DeFi)?",
      "options": [
        "Uncollateralized borrowing of any amount of cryptocurrency provided the borrowed funds plus fee are returned within the exact same atomic transaction block",
        "A loan that takes 30 days to approve",
        "A loan backed by physical real estate deeds",
        "A government-sponsored Web3 grant program"
      ],
      "correctIndex": 0,
      "explanation": "Flash loans allow borrowing without collateral because the EVM reverts the entire transaction if the principal and fee are not returned before the transaction completes."
    },
    {
      "id": 20,
      "question": "What is the difference between Soulbound Tokens (SBTs) and standard ERC-721 NFTs?",
      "options": [
        "Soulbound Tokens are non-transferable and permanently bound to a recipient's wallet address, designed for verifiable credentials, degrees, and reputation",
        "Soulbound Tokens have no expiration date while NFTs expire in 1 year",
        "Soulbound Tokens can only be minted on Bitcoin",
        "Soulbound Tokens represent fractional real estate shares"
      ],
      "correctIndex": 0,
      "explanation": "Proposed by Vitalik Buterin, Soulbound Tokens represent identity, educational credentials, and achievements that cannot be sold or transferred to other wallets."
    },
    {
      "id": 21,
      "question": "In Solidity, what happens if an external call reverts inside a transaction without try/catch handling?",
      "options": [
        "The entire transaction reverts, undoing all state changes made within that atomic block and consuming spent gas",
        "Only the failed function call is skipped and the transaction commits",
        "The smart contract is deleted from the blockchain",
        "The user's private key is rotated"
      ],
      "correctIndex": 0,
      "explanation": "EVM transactions are atomic: an unhandled revert cascades up the call stack, rolling back all state updates made during the transaction."
    },
    {
      "id": 22,
      "question": "What is the difference between `send()` and `transfer()` in Solidity?",
      "options": [
        "`transfer()` forwards 2300 gas and automatically reverts on failure; `send()` forwards 2300 gas and returns a boolean `false` on failure",
        "`send()` is free of gas",
        "`transfer()` can only send tokens, not ether",
        "`send()` is deprecated in Solidity 0.5"
      ],
      "correctIndex": 0,
      "explanation": "Both forward 2300 gas stipends, but transfer throws/reverts automatically while send requires checking the returned boolean."
    },
    {
      "id": 23,
      "question": "What is Slippage in automated market makers (AMMs) like Uniswap?",
      "options": [
        "The difference between the expected price of a trade and the actual execution price due to pool liquidity shifts from trade volume",
        "Network latency between validator nodes",
        "Gas price volatility in the mempool",
        "A software bug in the wallet app"
      ],
      "correctIndex": 0,
      "explanation": "Slippage occurs when trades move the constant-product curve (x * y = k), resulting in execution prices diverging from quotes."
    },
    {
      "id": 24,
      "question": "What is an EVM Reentrancy Guard modifier?",
      "options": [
        "A mutex lock variable set to locked upon entry and unlocked on exit, reverting if re-entered before completion",
        "A firewall that blocks non-US IP addresses",
        "A cryptographic zero-knowledge proof validator",
        "A hardware wallet authenticator"
      ],
      "correctIndex": 0,
      "explanation": "ReentrancyGuard uses a slot status (1 = not entered, 2 = entered). If a function is called while status is 2, it reverts."
    },
    {
      "id": 25,
      "question": "In Ethereum, what is the role of a Merkle Patricia Trie?",
      "options": [
        "Stores the entire state (account balances, nonces, storage, and code hashes) in an authenticated cryptographic tree verifiable by light clients",
        "Compresses video files uploaded to NFTs",
        "Routes transactions over the BitTorrent protocol",
        "Calculates block gas limits"
      ],
      "correctIndex": 0,
      "explanation": "The state trie maps 32-byte addresses to accounts in a modified radix trie whose root hash is committed in every block header."
    }
  ],
  "dataanalysis": [
    {
      "id": 1,
      "question": "What does DAX stand for in Microsoft Power BI and Analysis Services?",
      "options": [
        "Data Analysis Expressions",
        "Direct Access XML",
        "Data Aggregation Exchange",
        "Dynamic Array Extension"
      ],
      "correctIndex": 0,
      "explanation": "DAX is the formula and query language used in Power BI and tabular models."
    },
    {
      "id": 2,
      "question": "Which dimensional modeling schema connects a central Fact table directly to surrounding Dimension tables?",
      "options": [
        "Star Schema",
        "Snowflake Hierarchy",
        "Flat Matrix",
        "Normalized 3NF Cluster"
      ],
      "correctIndex": 0,
      "explanation": "A star schema connects one central fact table directly to dimension tables without sub-nesting."
    },
    {
      "id": 3,
      "question": "In Python Pandas, which method reshapes data from long format to wide format with aggregate summarization?",
      "options": [
        "pivot_table()",
        "melt()",
        "groupby()",
        "concat()"
      ],
      "correctIndex": 0,
      "explanation": "DataFrame.pivot_table() aggregates data into spreadsheet-style pivot matrices."
    },
    {
      "id": 4,
      "question": "What chart type is best suited for visualizing the 5-number summary (median, quartiles, outliers) of a distribution?",
      "options": [
        "Box Plot (Box and Whisker)",
        "Pie Chart",
        "Treemap",
        "Waterfall Chart"
      ],
      "correctIndex": 0,
      "explanation": "Box plots display minimum, Q1, median, Q3, and maximum with outlier markers."
    },
    {
      "id": 5,
      "question": "Which statistical coefficient measures the linear correlation between two continuous variables (-1 to +1)?",
      "options": [
        "Pearson Correlation Coefficient",
        "Standard Error",
        "Variance Inflation Factor",
        "Chi-Square Test"
      ],
      "correctIndex": 0,
      "explanation": "Pearson's r indicates strong negative (-1), zero (0), or strong positive (+1) linear relationships."
    },
    {
      "id": 6,
      "question": "What is Imputation in data preprocessing?",
      "options": [
        "Replacing missing null values with statistically estimated values (e.g. mean, median, KNN)",
        "Deleting all columns with zeros",
        "Normalizing text to lowercase",
        "Exporting data to CSV"
      ],
      "correctIndex": 0,
      "explanation": "Imputation replaces null/NaN records with representative values to avoid data loss."
    },
    {
      "id": 7,
      "question": "In Power BI, what is the key difference between Calculated Columns and Measures?",
      "options": [
        "Measures are computed on-the-fly dynamically responding to slicer context; Calculated Columns evaluate row-by-row during refresh and consume RAM",
        "Measures only work with strings",
        "Calculated columns use SQL",
        "There is no difference"
      ],
      "correctIndex": 0,
      "explanation": "Measures evaluate dynamically in filter context; Calculated columns are computed during data refresh."
    },
    {
      "id": 8,
      "question": "In the Empirical Rule of a standard Normal Distribution, what percentage of data falls within 1 standard deviation of the mean?",
      "options": [
        "68.2%",
        "50.0%",
        "95.4%",
        "99.7%"
      ],
      "correctIndex": 0,
      "explanation": "In a normal distribution, ~68.2% falls within 1 SD, ~95.4% within 2 SD, and ~99.7% within 3 SD."
    },
    {
      "id": 9,
      "question": "What does ETL stand for in modern data engineering and business intelligence?",
      "options": [
        "Extract, Transform, Load",
        "Encrypt, Transfer, Lock",
        "Evaluate, Test, Launch",
        "Export, Table, Label"
      ],
      "correctIndex": 0,
      "explanation": "ETL pipelines extract raw data, clean and aggregate it, and load it into analytical data warehouses."
    },
    {
      "id": 10,
      "question": "Which Pandas function removes duplicate rows based on specific subset columns?",
      "options": [
        "drop_duplicates()",
        "distinct()",
        "remove_dups()",
        "unique()"
      ],
      "correctIndex": 0,
      "explanation": "df.drop_duplicates(subset=...) drops repeated rows in place or returns a filtered copy."
    },
    {
      "id": 11,
      "question": "In Pandas, what is the critical difference between `.loc[]` and `.iloc[]` indexing?",
      "options": [
        "`.loc[]` is label-based (using column and index names), while `.iloc[]` is integer-position-based (0 to length - 1)",
        "`.loc[]` only works on numbers, while `.iloc[]` works on text",
        "`.iloc[]` modifies the original DataFrame permanently",
        "`.loc[]` is deprecated in Pandas 2.0"
      ],
      "correctIndex": 0,
      "explanation": "loc accesses rows and columns by labels/boolean arrays. iloc accesses by integer position index."
    },
    {
      "id": 12,
      "question": "How is an outlier mathematically identified using the Interquartile Range (IQR) method?",
      "options": [
        "Any data point smaller than $Q1 - 1.5 \\cdot \\text{IQR}$ or greater than $Q3 + 1.5 \\cdot \\text{IQR}$",
        "Any value greater than the mean plus one standard deviation",
        "Any negative numerical value",
        "Any data point that occurs only once in the dataset"
      ],
      "correctIndex": 0,
      "explanation": "The standard Tukey boxplot rule defines outliers as values outside the range [Q1 - 1.5 * IQR, Q3 + 1.5 * IQR]."
    },
    {
      "id": 13,
      "question": "What is the Central Limit Theorem and why is it foundational to inferential statistics?",
      "options": [
        "The distribution of sample means approaches a normal distribution as sample size increases, regardless of the underlying population's shape",
        "All datasets eventually converge to zero variance",
        "Every statistical hypothesis test has a 50% probability of being true",
        "Outliers always balance each other out in large datasets"
      ],
      "correctIndex": 0,
      "explanation": "The CLT guarantees that given a sufficiently large sample size, sample means are normally distributed, enabling z-tests and t-tests on non-normal populations."
    },
    {
      "id": 14,
      "question": "In Power BI DAX, what does the `CALCULATE()` function do?",
      "options": [
        "Evaluates an expression within a modified filter context, enabling dynamic overrides of report slicers and filters",
        "Performs basic arithmetic operations like addition and multiplication",
        "Formats dates according to the user's regional timezone",
        "Exports the Power BI report to an Excel spreadsheet"
      ],
      "correctIndex": 0,
      "explanation": "CALCULATE is the single most powerful DAX function: it transitions row context to filter context and applies new filter parameters."
    },
    {
      "id": 15,
      "question": "What is Simpson's Paradox in statistical analysis?",
      "options": [
        "A phenomenon where a trend appears in multiple distinct sub-groups of data but disappears or reverses when the groups are combined",
        "When two variables have a correlation coefficient greater than 1.0",
        "When the sample mean is equal to the sample median",
        "When a random sample perfectly represents the population"
      ],
      "correctIndex": 0,
      "explanation": "Simpson's Paradox occurs when confounding variables skew aggregated results, reversing observed group-level correlations."
    },
    {
      "id": 16,
      "question": "What is the difference between Star Schema and Snowflake Schema in data warehousing?",
      "options": [
        "In Star Schema, dimension tables are completely denormalized; in Snowflake Schema, dimension tables are normalized into sub-dimension tables",
        "Star Schema is used for NoSQL databases only",
        "Snowflake Schema does not use primary keys",
        "Star Schema cannot store numerical values"
      ],
      "correctIndex": 0,
      "explanation": "Star Schema uses flat, denormalized dimension tables for simpler queries and faster joins; Snowflake normalizes dimensions, reducing redundancy."
    },
    {
      "id": 17,
      "question": "What does a P-value smaller than 0.05 ($p < 0.05$) indicate in hypothesis testing?",
      "options": [
        "Statistically significant evidence to reject the Null Hypothesis ($H_0$) in favor of the Alternative Hypothesis ($H_a$)",
        "The experiment is completely invalid and must be discarded",
        "The probability that the Null Hypothesis is 100% true",
        "The sample size was too small to draw conclusions"
      ],
      "correctIndex": 0,
      "explanation": "A p-value < 0.05 indicates the observed data would be very unlikely under the assumption of the null hypothesis, providing evidence to reject it."
    },
    {
      "id": 18,
      "question": "In feature engineering, when should Standardization (Z-score) be chosen over Min-Max Normalization?",
      "options": [
        "When the data contains significant outliers and the ML algorithm assumes normally distributed features (e.g. Logistic Regression, SVM, PCA)",
        "When the data consists exclusively of binary 0 and 1 flags",
        "When the target variable is text strings",
        "When the dataset contains fewer than 10 rows"
      ],
      "correctIndex": 0,
      "explanation": "Standardization (mean=0, std=1) handles outliers much better than Min-Max scaling, which compresses non-outliers into a tiny range if extreme values exist."
    },
    {
      "id": 19,
      "question": "In customer analytics, what do the three components of RFM segmentation stand for?",
      "options": [
        "Recency (how recently a customer purchased), Frequency (how often), and Monetary value (how much they spent)",
        "Revenue, Forecast, and Market Share",
        "Retention, Fulfillment, and Marketing budget",
        "Refunds, Feedback, and Maintenance"
      ],
      "correctIndex": 0,
      "explanation": "RFM analysis segments customers by Recency, Frequency, and Monetary metrics to identify high-value champions, at-risk users, and churn candidates."
    },
    {
      "id": 20,
      "question": "In data visualization, why should 3D pie charts be avoided in analytical reporting?",
      "options": [
        "Perspective distortion alters the perceived area and angle of slices, causing viewers to misjudge quantitative proportions",
        "They consume 10x more GPU memory on mobile devices",
        "They can only display up to 2 categories",
        "They cannot be exported to PDF format"
      ],
      "correctIndex": 0,
      "explanation": "3D perspective distorts slice sizes (front slices look artificially larger than rear slices), violating data visualization accuracy standards."
    },
    {
      "id": 21,
      "question": "In Pandas, what is the difference between `df.dropna(how='any')` and `df.dropna(how='all')`?",
      "options": [
        "`how='any'` drops a row if ANY column contains a NaN; `how='all'` drops a row only if ALL columns are NaN",
        "`how='any'` deletes the entire DataFrame",
        "`how='all'` replaces NaNs with zeros",
        "Both methods behave identically"
      ],
      "correctIndex": 0,
      "explanation": "how='any' is strict and removes rows with even 1 missing value; how='all' only removes rows that are entirely empty."
    },
    {
      "id": 22,
      "question": "What is Pearson Correlation Coefficient ($r$) sensitive to that Spearman Rank Correlation is robust against?",
      "options": [
        "Non-linear relationships and extreme numerical outliers, because Pearson evaluates raw linear covariance rather than ranks",
        "Text strings",
        "Categorical variables with 2 classes",
        "Boolean values"
      ],
      "correctIndex": 0,
      "explanation": "Pearson measures linear relationships and is easily skewed by outliers; Spearman evaluates monotonic relationships on ranked data."
    },
    {
      "id": 23,
      "question": "In data warehousing, what is a Slowly Changing Dimension Type 2 (SCD2)?",
      "options": [
        "Preserves full historical accuracy by creating a new record row with effective start/end dates whenever an attribute changes",
        "Overwrites the old value directly without keeping history",
        "Deletes the record permanently",
        "Stores changes in an audit text file"
      ],
      "correctIndex": 0,
      "explanation": "SCD Type 2 tracks historical changes by inserting a new row with valid_from, valid_to, and is_current flags."
    },
    {
      "id": 24,
      "question": "What is the purpose of an A/B Test Statistical Power calculation ($1 - \\beta$)?",
      "options": [
        "The probability of correctly detecting a true treatment effect when one actually exists (avoiding Type II False Negative error)",
        "The probability that the test will finish in under 24 hours",
        "The percentage of website visitors that convert",
        "The server CPU power consumed by the test"
      ],
      "correctIndex": 0,
      "explanation": "Statistical power (typically targeted at 80% or 90%) ensures sample size is large enough to reliably detect true differences."
    },
    {
      "id": 25,
      "question": "What does `df.pivot_table(index='Region', columns='Product', values='Sales', aggfunc='sum')` do in Pandas?",
      "options": [
        "Reshapes tabular data into a multidimensional cross-tabulation table aggregating total sales by region and product",
        "Sorts the DataFrame alphabetically",
        "Deletes all sales columns",
        "Exports the data to a SQLite database"
      ],
      "correctIndex": 0,
      "explanation": "pivot_table reshapes tidy data into a cross-tabulated summary matrix with user-specified aggregation functions."
    }
  ],
  "general": [
    {
      "id": 1,
      "question": "What does the CAP theorem state regarding distributed data stores?",
      "options": [
        "A distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance simultaneously",
        "All distributed databases are consistent",
        "Network partitions never happen",
        "Availability cannot be measured"
      ],
      "correctIndex": 0,
      "explanation": "In the presence of network partitions (P), a system must trade off between consistency (C) and availability (A)."
    },
    {
      "id": 2,
      "question": "Which architectural style breaks monolithic applications into small, independently deployable services communicating via HTTP APIs or messaging?",
      "options": [
        "Microservices Architecture",
        "Monolithic Architecture",
        "Client-Server Tier",
        "Mainframe Batch"
      ],
      "correctIndex": 0,
      "explanation": "Microservices decouple business domains into independently scalable services."
    },
    {
      "id": 3,
      "question": "What does the 'S' in SOLID design principles stand for?",
      "options": [
        "Single Responsibility Principle",
        "Static Typing Principle",
        "Shared Memory Principle",
        "Subclassing Principle"
      ],
      "correctIndex": 0,
      "explanation": "Single Responsibility Principle dictates that a class or module should have one, and only one, reason to change."
    },
    {
      "id": 4,
      "question": "In Git, which command creates a new branch and switches to it in a single step?",
      "options": [
        "git checkout -b <branch-name> or git switch -c <name>",
        "git branch -new",
        "git commit -b",
        "git push --branch"
      ],
      "correctIndex": 0,
      "explanation": "`git checkout -b` or `git switch -c` creates and navigates to the new branch."
    },
    {
      "id": 5,
      "question": "What HTTP status code represents 'Internal Server Error'?",
      "options": [
        "500",
        "404",
        "401",
        "403"
      ],
      "correctIndex": 0,
      "explanation": "HTTP 500 signals an unhandled server-side exception."
    },
    {
      "id": 6,
      "question": "What does CORS (Cross-Origin Resource Sharing) configure in web browsers?",
      "options": [
        "Controls which external origin domains are permitted to access API resources via HTTP headers",
        "Encrypts client cookies",
        "Compresses web images",
        "Blocks search engines"
      ],
      "correctIndex": 0,
      "explanation": "CORS headers (e.g. Access-Control-Allow-Origin) tell browsers whether cross-origin requests are authorized."
    },
    {
      "id": 7,
      "question": "Which design pattern provides a single point of global access to a class by ensuring only one instance ever exists?",
      "options": [
        "Singleton Pattern",
        "Factory Pattern",
        "Observer Pattern",
        "Strategy Pattern"
      ],
      "correctIndex": 0,
      "explanation": "Singleton restricts instantiation to a single shared instance."
    },
    {
      "id": 8,
      "question": "What is the purpose of Semantic Versioning (SemVer: MAJOR.MINOR.PATCH)?",
      "options": [
        "MAJOR for breaking API changes, MINOR for backwards-compatible features, PATCH for backwards-compatible bug fixes",
        "Random release numbers",
        "Year.Month.Day only",
        "Git commit hash"
      ],
      "correctIndex": 0,
      "explanation": "SemVer communicates breaking changes and compatibility unambiguously."
    },
    {
      "id": 9,
      "question": "What is an API Gateway responsible for in microservices architectures?",
      "options": [
        "Reverse proxy handling routing, authentication, rate limiting, and SSL termination across microservices",
        "Writing frontend React components",
        "Managing database hard drives",
        "Running email newsletters"
      ],
      "correctIndex": 0,
      "explanation": "An API Gateway provides a centralized entry point with security, throttling, and telemetry."
    },
    {
      "id": 10,
      "question": "What does Test-Driven Development (TDD) advocate?",
      "options": [
        "Writing automated failing tests before writing the implementation code, followed by refactoring (Red-Green-Refactor)",
        "Testing only after deployment",
        "Manual QA testing only",
        "Skipping unit tests"
      ],
      "correctIndex": 0,
      "explanation": "TDD follows Red (write failing test) -> Green (write minimal code to pass) -> Refactor."
    },
    {
      "id": 11,
      "question": "In distributed systems, what does the CAP Theorem state?",
      "options": [
        "A distributed data store can guarantee at most two of the following three properties simultaneously: Consistency, Availability, and Partition Tolerance",
        "Every distributed system must have CPU, Architecture, and Performance constraints",
        "Concurrency is always inversely proportional to parallelism",
        "Databases must be backed up across at least 3 cloud providers"
      ],
      "correctIndex": 0,
      "explanation": "When a network partition (P) inevitably occurs in a distributed network, a system must choose between serving consistent data (C) or remaining available (A)."
    },
    {
      "id": 12,
      "question": "In REST API architectural design, what makes an HTTP method 'Idempotent'?",
      "options": [
        "Executing the exact same request multiple times produces the identical side-effect state on the server as executing it once (e.g. PUT, DELETE, GET)",
        "The method returns results in under 10 milliseconds",
        "The method encrypts request payloads using public keys",
        "The method can only be executed by admin users"
      ],
      "correctIndex": 0,
      "explanation": "An operation is idempotent if its multiple identical invocations have the same effect as a single invocation. GET, PUT, and DELETE are idempotent; POST is not."
    },
    {
      "id": 13,
      "question": "In Domain-Driven Design (DDD), what is a 'Bounded Context'?",
      "options": [
        "An explicit boundary within which a specific domain model applies and terms have exact, unambiguous definitions",
        "A maximum RAM limit set on Docker containers",
        "A database transaction timeout period",
        "A firewall restriction on microservice ports"
      ],
      "correctIndex": 0,
      "explanation": "A Bounded Context defines the boundary within which a ubiquitous domain language and its models remain consistent without semantic confusion."
    },
    {
      "id": 14,
      "question": "In the Rate Limiting Token Bucket algorithm, how are incoming requests processed?",
      "options": [
        "Tokens are added to a bucket at a fixed rate; each request consumes a token, and if the bucket is empty, requests are rejected or queued",
        "Requests are queued in a FIFO linked list indefinitely",
        "Incoming IP addresses are hashed and blocked every hour",
        "Every request is assigned a random cryptographic token"
      ],
      "correctIndex": 0,
      "explanation": "The Token Bucket algorithm allows bursts of traffic up to the bucket capacity while maintaining an average consumption rate defined by the token refill frequency."
    },
    {
      "id": 15,
      "question": "In microservices architecture, what does the Outbox Pattern ensure?",
      "options": [
        "Reliable dual-write consistency by writing events to a local database outbox table in the same transaction as entity updates, before publishing to message brokers",
        "Automatic archiving of emails to S3 cloud storage",
        "Instant rollback of failed git deployment commits",
        "Compression of outgoing JSON payloads"
      ],
      "correctIndex": 0,
      "explanation": "The Outbox pattern guarantees at-least-once message delivery to message brokers (Kafka/RabbitMQ) without distributed 2-phase commit transactions."
    },
    {
      "id": 16,
      "question": "What is the primary difference between Git Rebase and Git Merge?",
      "options": [
        "`git merge` creates a new merge commit preserving exact branch history; `git rebase` rewrites commit history by moving base commits into a clean, linear sequence",
        "`git rebase` deletes remote repository branches permanently",
        "`git merge` can only be executed on the main branch",
        "`git rebase` does not detect merge conflicts"
      ],
      "correctIndex": 0,
      "explanation": "Rebase rewrites commit history to produce a linear graph. Merge preserves the historical timeline with a dedicated merge commit joining branches."
    },
    {
      "id": 17,
      "question": "In software architecture, what is Hexagonal Architecture (Ports and Adapters)?",
      "options": [
        "Decouples the core business logic from external infrastructure (databases, UI, APIs) through interfaces (ports) and implementations (adapters)",
        "A design that mandates all microservices run on six server nodes",
        "A database schema consisting of six interconnected tables",
        "A protocol for compressing network packets in six stages"
      ],
      "correctIndex": 0,
      "explanation": "Hexagonal Architecture isolates business domain models from external technological concerns, allowing databases or web frameworks to be swapped cleanly."
    },
    {
      "id": 18,
      "question": "What is the difference between Concurrency and Parallelism?",
      "options": [
        "Concurrency is dealing with multiple tasks at once (interleaving structure); Parallelism is executing multiple tasks simultaneously (requiring multi-core hardware)",
        "Concurrency requires multiple physical computers; Parallelism runs on one core",
        "Parallelism is only used in database engines",
        "Concurrency is deprecated in modern programming languages"
      ],
      "correctIndex": 0,
      "explanation": "As Rob Pike noted: 'Concurrency is about structure; Parallelism is about execution.' Concurrency manages multiple tasks; parallelism executes them at the exact same physical moment."
    },
    {
      "id": 19,
      "question": "In Site Reliability Engineering (SRE), what is an 'Error Budget'?",
      "options": [
        "The maximum allowable amount of system downtime or errors defined by the difference between 100% and the Service Level Objective (e.g. $100\\% - 99.9\\% = 0.1\\%$)",
        "The financial cost allocated for buying bug-tracking software",
        "The total number of bugs a software engineer is allowed to commit",
        "The cloud hosting bill incurred by unexpected server crashes"
      ],
      "correctIndex": 0,
      "explanation": "An error budget (1 - SLO) balances system reliability and development velocity: features can be shipped rapidly until the error budget is depleted."
    },
    {
      "id": 20,
      "question": "In distributed transactions across microservices, how does the Saga Pattern handle failures?",
      "options": [
        "Executes compensating transactions in reverse order to undo the partial changes made by preceding steps if a subsequent step fails",
        "Locks all database rows across all microservices until all steps finish",
        "Restarts all microservice containers automatically",
        "Sends an error email to customer support without modifying data"
      ],
      "correctIndex": 0,
      "explanation": "Because distributed 2PC locking is slow and fragile, Sagas use compensating actions (e.g., refund payment, unreserve inventory) to achieve eventual consistency on failure."
    },
    {
      "id": 21,
      "question": "In system design, what is the Circuit Breaker pattern's 'Half-Open' state?",
      "options": [
        "A trial state that allows a limited number of requests through to test if the recovering downstream service has stabilized",
        "A state that accepts requests only from internal IP addresses",
        "A permanent error state requiring manual reboot",
        "A state where response payloads are truncated by 50%"
      ],
      "correctIndex": 0,
      "explanation": "In Half-Open state, if trial requests succeed, the breaker resets to Closed (normal); if any fail, it trips back to Open."
    },
    {
      "id": 22,
      "question": "In distributed caching, what is the Cache-Aside (Lazy Loading) pattern?",
      "options": [
        "The application first checks the cache; on a miss, it reads from the database, writes the result to the cache, and returns it",
        "The database writes directly to the cache in the background",
        "The cache automatically invalidates all data every 60 seconds",
        "The application never queries the database"
      ],
      "correctIndex": 0,
      "explanation": "Cache-aside loads data into cache on demand only when a cache miss occurs, ensuring unused data is not cached."
    },
    {
      "id": 23,
      "question": "In modern cloud infrastructure, what is 'Immutable Infrastructure'?",
      "options": [
        "Servers and containers are never updated in-place; changes are deployed by provisioning completely new instances and destroying old ones",
        "Servers that cannot be stopped or rebooted",
        "Databases that allow only INSERT statements",
        "Code written in functional languages exclusively"
      ],
      "correctIndex": 0,
      "explanation": "Immutable infrastructure prevents configuration drift and ensures reproducible, reliable environments across all stages."
    },
    {
      "id": 24,
      "question": "In Site Reliability Engineering, what is the difference between an SLO and an SLA?",
      "options": [
        "An SLO is an internal target reliability goal (e.g. 99.9% uptime); an SLA is a formal external contract with customers specifying penalties for failure",
        "An SLA is internal; an SLO is external",
        "They are identical acronyms",
        "An SLO only applies to network switches"
      ],
      "correctIndex": 0,
      "explanation": "SLOs are internal operational objectives to maintain quality; SLAs are legal customer commitments with business consequences."
    }
  ]
};

/**
 * Procedural Question Synthesizer:
 * Generates additional domain-authentic questions dynamically if requested challenge
 * length exceeds static bank size, guaranteeing that questions NEVER run out!
 */
function synthesizeDomainQuestions(primaryKey: string, neededCount: number, startId: number): ArenaQuestion[] {
  const synthesized: ArenaQuestion[] = [];
  
  const domainScenarios: Record<string, Array<{ q: string; a: string; wrong: string[]; exp: string }>> = {
    "springboot": [
      {
        q: "What is the primary architectural purpose of `@EnableAutoConfiguration` in Spring Boot?",
        a: "Attempts to guess and configure beans based on jar dependencies present on the classpath",
        wrong: ["Compiles Java source files to .class binaries", "Encrypts all REST endpoints with AES-256", "Deletes unused tables from the database"],
        exp: "@EnableAutoConfiguration instructs Spring Boot to automatically configure beans based on added starter jars."
      },
      {
        q: "In Spring Data JPA, what does the `@Modifying` annotation indicate when used on a `@Query` method?",
        a: "Informs Spring Data that the query executes an INSERT, UPDATE, or DELETE rather than a SELECT",
        wrong: ["Converts the query to GraphQL syntax", "Marks the query as read-only for replica instances", "Runs the query in a separate thread asynchronously"],
        exp: "@Modifying is required on repository methods executing UPDATE or DELETE queries."
      },
      {
        q: "How does Spring Boot handle cross-origin requests when `@CrossOrigin(origins = 'https://app.example.com')` is placed on a controller?",
        a: "Sets the `Access-Control-Allow-Origin` HTTP header in preflight responses to allow trusted cross-origin calls",
        wrong: ["Blocks all incoming traffic from the internet", "Proxies the request through Tor network", "Disables CSRF protection globally"],
        exp: "@CrossOrigin configures CORS headers allowing browser clients on specified origins to interact with the API."
      },
      {
        q: "What does the `@Profile('!prod')` annotation mean on a Spring Bean?",
        a: "The bean is active in all profiles EXCEPT the production 'prod' profile",
        wrong: ["The bean is active exclusively in production", "The bean is permanently deprecated", "The bean runs only on Windows servers"],
        exp: "The exclamation mark '!' negates profile matching, activating the component in dev/test but excluding prod."
      },
      {
        q: "In Spring Boot 3, which Java library is the standard implementation for JSON parsing and serialization?",
        a: "Jackson (`com.fasterxml.jackson.databind.ObjectMapper`)",
        wrong: ["Gson", "FastJSON", "XMLBeans"],
        exp: "Spring Boot includes Jackson Databind by default as its standard JSON serialization engine."
      }
    ],
    "python": [
      {
        q: "What is the time complexity of looking up a key in a Python `dict` with no hash collisions?",
        a: "$O(1)$ constant average time complexity",
        wrong: ["$O(N)$ linear time complexity", "$O(log N)$ logarithmic complexity", "$O(N^2)$ quadratic complexity"],
        exp: "Python dictionaries use open-addressing hash tables, achieving O(1) average lookup and insertion."
      },
      {
        q: "In Python, what is the result of `'hello'.split('l')`?",
        a: "['he', '', 'o']",
        wrong: ["['he', 'o']", "['hello']", "['h', 'e', 'l', 'l', 'o']"],
        exp: "Splitting 'hello' on 'l' produces an empty string between the two adjacent 'l' characters: ['he', '', 'o']."
      },
      {
        q: "Which built-in Python module is used to measure the execution time of small code snippets?",
        a: "`timeit`",
        wrong: ["`benchmark`", "`speedtest`", "`profiler`"],
        exp: "The timeit module accurately measures execution times of Python statements by avoiding OS overhead."
      }
    ],
    "react": [
      {
        q: "What is the primary role of React's Virtual DOM reconciliation engine?",
        a: "Computes the minimal set of real DOM operations (diffing) required to update the screen efficiently",
        wrong: ["Compiles JSX into WebAssembly bytecode", "Stores component state in browser cookies", "Replaces the CSS cascade model"],
        exp: "The Virtual DOM calculates differences between trees to minimize expensive real browser DOM manipulations."
      },
      {
        q: "In React, what happens when `setState` is called with the exact same primitive value as current state?",
        a: "React bails out of re-rendering the component and its children (`Object.is` equality check)",
        wrong: ["React throws a fatal runtime warning", "React unmounts the component immediately", "React re-renders the entire root tree"],
        exp: "React uses Object.is comparison; if the new state value is identical, it skips re-rendering for efficiency."
      }
    ]
  };

  const scenarios = domainScenarios[primaryKey] || domainScenarios["springboot"];
  for (let i = 0; i < neededCount; i++) {
    const s = scenarios[i % scenarios.length];
    synthesized.push({
      id: startId + i + 1,
      question: `[Practice Scenario #${i + 1}] ${s.q}`,
      options: [s.a, ...s.wrong],
      correctIndex: 0,
      explanation: s.exp,
    });
  }
  return synthesized;
}

/**
 * Returns a high-capacity question set tailored to the specific video.
 * Supports requesting 15, 30, 50, 75, 100, 150+ questions!
 */
export function getQuestionsForVideo(skillName?: string, title?: string, count: number = 30): ArenaQuestion[] {
  const combined = ((skillName || "") + " " + (title || "")).toLowerCase();
  
  let primaryKey = "general";
  if (combined.includes("spring") || combined.includes("java") || combined.includes("hibernate") || combined.includes("backend")) {
    primaryKey = "springboot";
  } else if (combined.includes("python") || combined.includes("django") || combined.includes("flask") || combined.includes("numpy")) {
    primaryKey = "python";
  } else if (combined.includes("react") || combined.includes("javascript") || combined.includes("typescript") || combined.includes("frontend") || combined.includes("node") || combined.includes("next.js") || combined.includes("native")) {
    primaryKey = "react";
  } else if (combined.includes("gpt") || combined.includes("machine") || combined.includes("ai") || combined.includes("deep") || combined.includes("pytorch") || combined.includes("tensorflow") || combined.includes("transformer") || combined.includes("neural")) {
    primaryKey = "machinelearning";
  } else if (combined.includes("sql") || combined.includes("database") || combined.includes("postgres") || combined.includes("relational") || combined.includes("mongo") || combined.includes("redis")) {
    primaryKey = "database";
  } else if (combined.includes("docker") || combined.includes("cloud") || combined.includes("aws") || combined.includes("kubernetes") || combined.includes("devops") || combined.includes("linux")) {
    primaryKey = "cloud";
  } else if (combined.includes("cyber") || combined.includes("security") || combined.includes("ethical") || combined.includes("hacking") || combined.includes("zero trust")) {
    primaryKey = "cybersecurity";
  } else if (combined.includes("power bi") || combined.includes("excel") || combined.includes("analytics") || combined.includes("tableau") || combined.includes("data analysis")) {
    primaryKey = "dataanalysis";
  } else if (combined.includes("blockchain") || combined.includes("solidity") || combined.includes("web3") || combined.includes("crypto") || combined.includes("ethereum") || combined.includes("smart contract")) {
    primaryKey = "blockchain";
  } else if (combined.includes("algorithm") || combined.includes("dsa") || combined.includes("leet") || combined.includes("tree") || combined.includes("graph") || combined.includes("structure")) {
    primaryKey = "dsa";
  }

  const primaryQuestions = QUESTION_BANK[primaryKey] || QUESTION_BANK.general;
  const targetCount = count || Math.max(30, primaryQuestions.length);
  const blended: ArenaQuestion[] = [...primaryQuestions];

  // 1. Draw from across the full question bank so pool is rich & multi-disciplinary
  if (blended.length < targetCount) {
    const allCategoryKeys = Object.keys(QUESTION_BANK);
    for (const catKey of allCategoryKeys) {
      if (blended.length >= targetCount) break;
      if (catKey === primaryKey) continue;
      const catQuestions = QUESTION_BANK[catKey] || [];
      for (const q of catQuestions) {
        if (blended.length >= targetCount) break;
        if (!blended.some((existing) => existing.question === q.question)) {
          blended.push({
            ...q,
            id: blended.length + 1,
          });
        }
      }
    }
  }

  // 2. If user requests even more questions than entire static catalog (e.g. 200+), synthesize dynamically
  if (blended.length < targetCount) {
    const needed = targetCount - blended.length;
    const synth = synthesizeDomainQuestions(primaryKey, needed, blended.length);
    blended.push(...synth);
  }

  const selected = targetCount ? blended.slice(0, targetCount) : blended;
  return selected.map((q) => shuffleQuestionOptions(q));
}

/**
 * Shuffles options of an ArenaQuestion and tracks the correct index accurately.
 */
export function shuffleQuestionOptions(q: ArenaQuestion): ArenaQuestion {
  const correctOptionText = q.options[q.correctIndex];
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  const newIndex = shuffledOptions.indexOf(correctOptionText);
  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newIndex >= 0 ? newIndex : 0,
  };
}
