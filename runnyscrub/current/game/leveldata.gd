extends RefCounted
class_name class_level_data

var config

var num_platforms_total: int = 0
var num_platform_chunks: int = 0
var platform_data_chunk_array: Array[Vector2i] #left_most_x, right_most_x
#var platform_data_chunk_dict: Dictionary[int, PackedInt64Array] = {} #Upgrade to 4.4 to get this
var platform_data_chunk_dict: Dictionary = {}

#Platform Data (Header + Elements of 16 x 64bit Ints. Can reduce size later if fields not used)
#=========================================
#Leading Data Header (size of this is stored in config, must be manually updated)
var index_min_platform_global_index : int = 0
var index_max_platform_global_index : int = 1
var index_num_elements_used : int = 2
var index_instantiated_element_offset_min: int = 3 #Good idea? /used?
var index_instantiated_element_offset_max: int = 4
#Per Element Data
var index_offset_chunk_index : int = 0
var index_offset_global_index : int = 1
var index_offset_instantiated : int = 2
var index_offset_type_id : int = 3
var index_offset_left : int = 4
var index_offset_top : int = 5
var index_offset_width : int = 6
var index_offset_extra_dimension_0 : int = 7
var index_offset_extra_dimension_1 : int = 8
var index_offset_extra_dimension_2 : int = 9
var index_offset_extra_dimension_3 : int = 10
var index_offset_texture_id : int = 11
var index_offset_extra_property_0 : int = 12
var index_offset_extra_property_1 : int = 13
var index_offset_extra_property_2 : int = 14
var index_offset_extra_property_3 : int = 15
#=========================================

func init(conf): #Couldnt be fucked to mince over inner class _init / constructors so just manually calling an init
    config = conf
    var first_chunk_data : PackedInt64Array = generate_new_chunk_data()
    add_chunk_data(first_chunk_data)	

func generate_new_chunk_data() -> PackedInt64Array:
    var chunk_data : PackedInt64Array = PackedInt64Array() 
    chunk_data.resize(config.PLATFORM_DATA_LEADING_HEADER_SIZE
        + (config.NUM_ELEMENTS_IN_PLATFORM_DATA_ARRAY * config.PLATFORM_DATA_ARRAY_ELEMENT_SIZE))
    chunk_data.fill(config.MIN_64_BIT_INT)
    chunk_data[index_num_elements_used] = 0
    return chunk_data

func add_chunk_data(chunk_data : PackedInt64Array):
    var index = num_platform_chunks 
    platform_data_chunk_array.push_back(Vector2i(config.MAX_64_BIT_INT, config.MIN_64_BIT_INT)) #This will be at index 'index'
    platform_data_chunk_dict[index] = chunk_data
    num_platform_chunks += 1	

func index_of_element(element : int) -> int:
    assert(element >= 0)
    assert(element < config.NUM_ELEMENTS_IN_PLATFORM_DATA_ARRAY)
    return config.PLATFORM_DATA_LEADING_HEADER_SIZE + (element * config.PLATFORM_DATA_ARRAY_ELEMENT_SIZE)

func add_next_platform( instantiated : int,
                        type_id : int,
                        left : int,
                        top : int,
                        width : int,
                        extra_dimension_0 : int,
                        extra_dimension_1 : int,
                        extra_dimension_2 : int,
                        extra_dimension_3 : int,
                        texture_id : int,
                        extra_property_0 : int,
                        extra_property_1 : int,
                        extra_property_2 : int,
                        extra_property_3 : int,
                        start_of_new_chunk_that_is_not_the_first: bool) -> Vector3i: # Returns: ChunkId, PlatformChunkIndex, PlatformGlobalIndex
    var chunk_id = num_platform_chunks -1
    if start_of_new_chunk_that_is_not_the_first:
        var last_chunk_id = chunk_id - 1
        platform_data_chunk_array[last_chunk_id].y = left #Or does it need to be -1? it's to stop there being a blank space between chunks when analysing for holes
    var last_chunk = platform_data_chunk_dict[chunk_id] #Pretty certain we get a reference here, not copy
    if last_chunk == null:
        push_error("leveldata/add_next_platform(): The last chunk is currently offloaded, you cannot add platforms until it returns to scope (is reloaded due to player position)")
        pass
    var num_elements_in_last_chunk = last_chunk[index_num_elements_used]
    if num_elements_in_last_chunk == config.NUM_ELEMENTS_IN_PLATFORM_DATA_ARRAY:
        #Chunk is full -> start a new chunk
        #Ensure to mark the right most value of the closing chunk as the left value of the platform about to be made
        var new_chunk_data : PackedInt64Array = generate_new_chunk_data()
        add_chunk_data(new_chunk_data)
        add_next_platform(instantiated, type_id, left, top, width,
            extra_dimension_0, extra_dimension_1, extra_dimension_2, extra_dimension_3,
            texture_id, 
            extra_property_0, extra_property_1, extra_property_2, extra_property_3,
            true) #Single recursion
        #Is there an issue if we move to a new chunk here? (TO DO - check if something else needs to be done)
    var new_platform_chunk_index : int = num_elements_in_last_chunk
    var new_platform_global_index : int = num_platforms_total

    if new_platform_global_index < last_chunk[index_min_platform_global_index]:
        last_chunk[index_min_platform_global_index] = new_platform_global_index
    if new_platform_global_index > last_chunk[index_max_platform_global_index]:
        last_chunk[index_max_platform_global_index] = new_platform_global_index 

    var element_base_index : int = index_of_element(new_platform_chunk_index)
    #Fill properties
    last_chunk[element_base_index + index_offset_chunk_index] = new_platform_chunk_index 
    last_chunk[element_base_index + index_offset_global_index] = new_platform_global_index
    last_chunk[element_base_index + index_offset_instantiated] = instantiated 
    last_chunk[element_base_index + index_offset_type_id] = type_id
    last_chunk[element_base_index + index_offset_left] = left
    last_chunk[element_base_index + index_offset_top] = top 
    last_chunk[element_base_index + index_offset_width] = width
    last_chunk[element_base_index + index_offset_extra_dimension_0] = extra_dimension_0 
    last_chunk[element_base_index + index_offset_extra_dimension_1] = extra_dimension_1
    last_chunk[element_base_index + index_offset_extra_dimension_2] = extra_dimension_2
    last_chunk[element_base_index + index_offset_extra_dimension_3] = extra_dimension_3
    last_chunk[element_base_index + index_offset_texture_id] = texture_id
    last_chunk[element_base_index + index_offset_extra_property_0] = extra_property_0
    last_chunk[element_base_index + index_offset_extra_property_1] = extra_property_1 
    last_chunk[element_base_index + index_offset_extra_property_2] = extra_property_2 
    last_chunk[element_base_index + index_offset_extra_property_3] = extra_property_3 

    if left < platform_data_chunk_array[chunk_id].x:
        platform_data_chunk_array[chunk_id].x = left
    if left + width > platform_data_chunk_array[chunk_id].y:
        platform_data_chunk_array[chunk_id].y = left + width

    last_chunk[index_num_elements_used] += 1
    num_platforms_total += 1 

    return Vector3i(chunk_id, new_platform_chunk_index, new_platform_global_index)

func store_and_retrieve_chunks_if_required(): #Maybe named something different or split. TBC
    #This is the whole reason for the chunk system
    #To be able to only have relevent chunks in memory
    #and in the super unlikely event a game runs too long for memory
    #it atleast doesn't have everything loaded
    #implement later - also, think about coordination with 
    #any instantiated level data objects/nodes? perhaps this comes 
    #from elsewhere? maybe not
    pass