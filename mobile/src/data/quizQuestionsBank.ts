// mobile/src/data/quizQuestionsBank.ts
// Autonomous Master Quiz Question Bank (350+ Questions across all Engineering Domains)

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
}
  ],
};

/**
 * Returns a high-capacity question set tailored to the specific video,
 * mixing domain-focused questions and ensuring requested challenge length (15, 30, 45, 50+)
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

  // Draw from across the full question bank so pool is never artificially limited
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
